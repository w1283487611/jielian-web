<template>
    <view>
        <view>
            <view class="h1">select-role</view>
            <button>我是学员</button>

            <button>我是教练</button>
        </view>
        <!-- 自定义 TabBar -->
        <tabbar />
    </view>
</template>

<script setup lang="js">
import Tabbar from "@/components/tabbar/index.vue";
</script>

<style scoped>
.content {}

.h1 {
    font-size: large;
}
</style>