import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

const useTestStore = defineStore("test",()=>{
    const test = ref("test");
    const n = ref(666);

    return {
        test,
        n
    }
},
{// 这里是Store的配置选项
    unistorage: true // 开启持久化
}
);


export default useTestStore;