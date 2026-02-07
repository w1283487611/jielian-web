<template>
    <view>
        my
        <navigator url="/pages/select-role/select-role" open-type="navigate" class="link-type">
            角色选择
        </navigator>
    </view>
    <!-- 自定义 TabBar -->
    <tabbar />

</template>

<script setup lang="js">
import Tabbar from "@/components/tabbar/index.vue";
</script>

<style scoped>
.content {}
</style>