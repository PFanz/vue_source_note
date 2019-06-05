// vue实例 *
let vm = {}

// vue中的data属性 *
let data = () => ({
  a: 1,
  b: {
    a: 1
  }
})

// 获取真正的data对象
data = vm._data = getData(data, vm)

function getData (data, vm) {
  // 先不考虑
  // pushTarget()

  try {
    return data.call(vm, vm)
  } catch (e) {
    return {}
  } finally {

    // 先不考虑
    // popTarget()

  }
}

// 对data的key进行检测
// ...

let sharedPropertyDefinition = {}

// 将data(_data)代理到vm下，实现对获取/设置拦截
for (const key in data) {
  proxy(vm, `_data`, key)
}

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    console.log(`读取的${sourceKey}上的${key}`)
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    console.log(`设置的${sourceKey}上的${key}`)
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

console.log(vm._data.b.a)
vm.b.a = 2
console.log(vm._data.b.a)
