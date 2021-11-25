const protobufjs = require('protobufjs')
const fs = require('fs')
const path = require('path')

const MAX_STACK_SIZE = 3

function addIncludePathToRoot (root, includePaths) {
  const originalResolvePath = root.resolvePath
  root.resolvePath = (origin, target) => {
    if (path.isAbsolute(target)) {
      return target
    }
    for (const directory of includePaths) {
      const fullPath = path.join(directory, target)
      try {
        fs.accessSync(fullPath, fs.constants.R_OK)
        return fullPath
      } catch (err) {
      }
    }
    return originalResolvePath(origin, target)
  }
}

async function fromFileName (fileName, includeDirs) {
  console.log(fileName)
  includeDirs = includeDirs ? [...includeDirs] : []
  let iPath = ''
  if (path.isAbsolute(fileName)) {
    iPath = path.dirname(fileName)
    // includeDirs.push(path.dirname(fileName))
  } else {
    iPath = path.dirname(path.join(process.cwd(), fileName))
  }
  console.log('iPath', iPath)
  includeDirs.push(iPath)
  includeDirs.push(iPath + '/src/*/*')

  const protoRoot = new protobufjs.Root()
  if (includeDirs) {
    addIncludePathToRoot(protoRoot, includeDirs)
  }
  const root = await protoRoot.load(fileName, { keepCase: true })

  return {
    name: path.basename(fileName) || '',
    filePath: fileName,
    root
  }
}

function walkNamespace (root, onNamespace, parentNamespace) {
  const nestedType = (parentNamespace && parentNamespace.nested) || root.nested
  if (nestedType) {
    Object.keys(nestedType).forEach(typeName => {
      const nestedNamespace = root.lookup(typeName)
      if (nestedNamespace && isNamespace(nestedNamespace)) {
        onNamespace(nestedNamespace)
      }
    })
  }
}

function walkServices (proto, onService) {
  const { root } = proto
  // console.log('walkServices root', root)
  walkNamespace(root, namespace => {
    const nestedNamespaceTypes = namespace.nested
    if (nestedNamespaceTypes) {
      const fullNamespaceName = (namespace.fullName.startsWith('.'))
        ? namespace.fullName.replace('.', '')
        : namespace.fullName
      console.log('fullNamespaceName', fullNamespaceName)
      Object.keys(nestedNamespaceTypes).forEach(nestedTypeName => {
        const nestedType = root.lookup(`${fullNamespaceName}.${nestedTypeName}`)
        if (nestedType instanceof protobufjs.Service && path.basename(nestedType.filename) === proto.name) {
          const serviceName = [
            ...fullNamespaceName.split('.'),
            nestedType.name
          ]
          const fullyQualifiedServiceName = serviceName.join('.')
          onService(nestedType, fullyQualifiedServiceName)
        }
      })
    }
  })
}

function parseServiceMethods (service, type, mocks) {
  const root = service.root
  const serviceMethods = service.methods
  return Object.keys(serviceMethods).reduce((methods, method) => {
    const serviceMethod = serviceMethods[method]
    const methodMessageType = type === 0 ? serviceMethod.requestType : serviceMethod.responseType
    const messageType = root.lookupType(methodMessageType)
    methods[method] = () => {
      let data = {}
      if (!mocks) {
        data = mockTypeFields(messageType)
      }
      return {
        plain: data,
        messageType: messageType,
        responseType: root.lookupType(serviceMethod.responseType)
        // message: messageType.fromObject(data)
      }
    }
    return methods
  }, {})
}

function parseServices (proto) {
  const services = {}
  // console.log('parseServices', proto)
  walkServices(proto, (service, serviceName) => {
    // console.log('walkServices:', serviceName)
    const methods = parseServiceMethods(service, 0)
    services[serviceName] = {
      serviceName,
      proto,
      requestMethods: methods
    }
  })
  return services
}

export function wrapProtoLoad (fileList, onProtoUploaded) {
  const protoList = fileList.reduce((wrapList, fileName) => {
    wrapList.push({
      name: path.basename(fileName) || '',
      filePath: fileName,
      load: async () => {
        try {
          const proto = await fromFileName(fileName)
          const services = parseServices(proto)
          return {
            proto,
            services
          }
        } catch (e) {
          console.error(e)
        }
      }
    })
    return wrapList
  }, [])
  onProtoUploaded && onProtoUploaded(protoList)
  return protoList
}

export async function loadProtosFromFiles (files, onProtoUploaded) {
  try {
    const protos = await Promise.all(files.map(fileName => {
      return fromFileName(fileName)
    }))

    const protoList = protos.reduce((list, proto) => {
      const services = parseServices(proto)
      if (Object.keys(services).length > 0) {
        list.push({
          name: proto.name,
          filePath: proto.filePath,
          proto,
          services
        })
      }
      return list
    }, [])
    onProtoUploaded && onProtoUploaded(protoList)
    return protoList
    // console.log('protos', protos)
  } catch (e) {
    console.error(e)
  }
}

function isNamespace (lookupType) {
  return (lookupType instanceof protobufjs.Namespace) &&
    !(lookupType instanceof protobufjs.Service) &&
    !(lookupType instanceof protobufjs.Type) &&
    !(lookupType instanceof protobufjs.Enum) &&
    !(lookupType instanceof protobufjs.Field) &&
    !(lookupType instanceof protobufjs.MapField) &&
    !(lookupType instanceof protobufjs.OneOf) &&
    !(lookupType instanceof protobufjs.Method)
}

function mockTypeFields (type, stackDepth = {}) {
  if (stackDepth[type.name] > MAX_STACK_SIZE) {
    return {}
  }
  if (!stackDepth[type.name]) {
    stackDepth[type.name] = 0
  }
  stackDepth[type.name]++
  const filedData = {}
  return type.fieldsArray.reduce((data, field) => {
    field.resolve()
    if (field.parent !== field.resolvedType) {
      if (field.repeated) {
        data[field.name] = [mockField(field, stackDepth)]
      } else {
        data[field.name] = mockField(field, stackDepth)
      }
    }
    return data
  }, filedData)
}

function mockEnum (enumType) {
  const enumKey = Object.keys(enumType.values)[0]
  return enumType.values[enumKey]
}

function mockField (field, stackDepth) {
  if (field instanceof protobufjs.MapField) {
    let mockPropertyValue = null
    if (field.resolvedType === null) {
      mockPropertyValue = mockScalar(field.type, field.name)
    }
    if (mockPropertyValue === null) {
      const resolvedType = field.resolvedType
      if (resolvedType instanceof protobufjs.Type) {
        if (resolvedType.oneofs) {
          mockPropertyValue = pickOneOf(resolvedType.oneofsArray)
        } else {
          mockPropertyValue = mockTypeFields(resolvedType)
        }
      } else if (resolvedType instanceof protobufjs.Enum) {
        mockPropertyValue = mockEnum(resolvedType)
      } else if (resolvedType === null) {
        mockPropertyValue = {}
      }
    }
    return {
      [mockScalar(field.keyType, field.name)]: mockPropertyValue
    }
  }
  if (field.resolvedType instanceof protobufjs.Type) {
    return mockTypeFields(field.resolvedType, stackDepth)
  }
  if (field.resolvedType instanceof protobufjs.Enum) {
    return mockEnum(field.resolvedType)
  }
  const mockPropertyValue = mockScalar(field.type, field.name)
  if (mockPropertyValue === null) {
    const resolvedField = field.resolve()
    return mockField(resolvedField, stackDepth)
  } else {
    return mockPropertyValue
  }
}

function pickOneOf (oneOfs) {
  return oneOfs.reduce((fields, oneOf) => {
    fields[oneOf.name] = mockField(oneOf.fieldsArray[0])
    return fields
  }, {})
}

function mockScalar (type, fieldName) {
  switch (type) {
    case 'string':
      return interpretMockViaFieldName(fieldName)
    case 'number':
      return 0
    case 'bool':
      return false
    case 'int32':
      return 0
    case 'int64':
      return 0
    case 'uint32':
      return 0
    case 'uint64':
      return 0
    case 'sint32':
      return 0
    case 'sint64':
      return 0
    case 'fixed32':
      return 0
    case 'fixed64':
      return 0
    case 'sfixed32':
      return 0
    case 'sfixed64':
      return 0
    case 'double':
      return 0.0
    case 'float':
      return 0.0
    case 'bytes':
      return Buffer.from('Hello')
    default:
      return null
  }
}

function interpretMockViaFieldName (fieldName) {
  // const fieldNameLower = fieldName.toLowerCase()
  // if (fieldNameLower.startsWith('id') || fieldNameLower.endsWith('id')) {
  //   return uuid.v4()
  // }
  return ''
}
