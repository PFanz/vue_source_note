const data = {
  a: 1,
  b: {
    a: 1
  }
}

class Observer {
  constructor (value) {
    this.value = value
    // 收集依赖的筐
    // this.dep = new Dep()
    this.vmCount = 0
    // 为value(data)添加__ob__属性，属性值为this(observer对象) @1
    def(value, '__ob__', this)

    // 纯函数和数组执行不同方法
    if (Array.isArray(value)) {
      // const augment = hasProto
      //   ? protoAugment
      //   : copyAugment
      // augment(value, arrayMethods, arrayKeys)
      // this.observeArray(value)
    } else {
      // 纯对象处理 @2
      // this.walk(value)
    }
  }

  walk (obj) {
  }

  observeArray (items) {
  }
}

function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

// #1
// const ob = new Observer(data)
// console.log(ob)
// console.log(data.__ob__)
// console.log(ob === data.__ob__)

// #2
// Observer 中的 walk， 手动执行
function walk (obj) {
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i])
  }
}
walk(data)
// 执行 walk 之后的 data
// data = {
//  a: 1,
//  b: {
//    a: 1
//    __ob__: {a, dep, vmCount}
//  }
//  __ob__: {data, dep, vmCount}
// }
// console.log(data.a.__ob__)

// 设置getter/setter
function defineReactive (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  // 收集依赖的筐
  // const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  // let childOb = !shallow && observe(val)
  // observe函数就是经过一段判断（如果不是对象或数组会返回undefined）
  // 执行new Observer()，所以可以简单理解成下面
  // 这里是个递归
  // eslint-disable-next-line no-unused-vars
  let childOb
  if (typeof val === 'object' || Array.isArray(val)) {
    childOb = !shallow && new Observer(val)
    if (childOb) {
      walk(val)
    }
  }
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      // 收集依赖 @3
      return value
    },
    set: function reactiveSetter (newVal) {
      // 触发依赖
      // dep.notify()
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
    }
  })
}

// 截止到这里，纯对象属性已经被深度可响应，后面需要在 get 和 set 中分别收集依赖以及触发依赖

// #3
// if (Dep.target) {
//   dep.depend()
//   if (childOb) {
//     除了a的setter通过闭包保存的dep收集了依赖，a.__ob__中也保存了dep，后一个dep用于使用$set添加属性时候，触发依赖
//     childOb.dep.depend()
//     if (Array.isArray(value)) {
//       dependArray(value)
//     }
//   }
// }

// 从下面set方法可以看到，触发的是__ob__.dep
class Vue {}
Vue.set = function (obj, key, val) {
  defineReactive(obj, key, val)
  obj.__ob__.dep.notify()
}

// #####

// 数组处理方式——拦截数组变异方法

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果有新增加的元素，使该元素响应式
    if (inserted) ob.observeArray(inserted)
    // 触发依赖
    ob.dep.notify()
    return result
  })
})
