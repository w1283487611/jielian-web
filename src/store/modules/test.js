import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';

const useTestStore = defineStore("test",()=>{
    let test = ref("test");

    return {
        test
    }
});


export default useTestStore;