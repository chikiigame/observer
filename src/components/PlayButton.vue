<template>
  <el-icon class="playIcon" @click="onClick">
<!--    <video-play />-->
    <caret-right />
  </el-icon>
</template>

<script>
import { CaretRight } from '@element-plus/icons'
export default {
  props: {
    onPlayButtonClick: {
      type: Function
    }
  },
  data () {
    return {}
  },
  methods: {
    onClick () {
      // console.log('play buton click')
      if (this.onPlayButtonClick) {
        this.onPlayButtonClick()
      }
    }
  },
  components: { CaretRight }
}
</script>

<style>
.playIcon {
  font-size: 50px;
  color: #ffffff;
  border: 3px solid rgb(238, 238, 238);
  border-radius: 50%;
  cursor: pointer;
  background: #28d440;
}
</style>
