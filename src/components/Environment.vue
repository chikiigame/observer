<template>
  <section>
    <el-form :model="formData" :label-position="labelPosition">
      <el-form-item label="配置名称:">
        <el-input v-model="formData.name" ></el-input>
      </el-form-item>
      <el-form-item label="请求url:">
        <el-input v-model="formData.url" ></el-input>
      </el-form-item>
      <el-form-item label="app名称:">
        <el-input v-model="formData.app" ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">Submit</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
export default {
  props: {
    environmentData: {
      type: Object
    },
    onSubmit: {
      type: Function
    }
  },
  data () {
    return {
      labelPosition: 'right',
      formData: Object.assign({}, this.environmentData)
    }
  },
  methods: {
    getData () {
      return Object.assign({}, this.formData)
    },
    resetData (data) {
      this.formData = data
    },
    submitForm () {
      console.log('submitForm', this.formData)
      this.$store.commit('updateEnvironment', Object.assign({}, this.formData))
      if (this.onSubmit) {
        this.onSubmit()
      }
    }
  }
}
</script>

<style>
/*.el-form-item--mini .el-form-item__label {*/
/*  line-height: 40px;*/
/*}*/
</style>
