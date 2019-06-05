const Vue = require('vue')

const vm = new Vue({
  data: {
    a: 1,
    b: {
      a: 2
    }
  }
})

// 通过代理，下面的是完全相等的
console.log(vm.b === vm._data.b, vm.b === vm.$options.data().b)
