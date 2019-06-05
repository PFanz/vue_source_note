// watcher 对表达式的求值，触发了数据属性的 get 拦截器函数，从而收集到了依赖，当数据变化时能够触发响应
// Watcher 观察者实例将对 updateComponent 函数求值，我们知道 updateComponent 函数的执行会间接触发渲染函数(vm.$options.render)的执行，而渲染函数的执行则会触发数据属性的 get 拦截器函数，从而将依赖(观察者)收集，当数据变化时将重新执行 updateComponent 函数，这就完成了重新渲染。同时我们把上面代码中实例化的观察者对象称为 渲染函数的观察者。

let vm = {}

const updateComponent = () => {
  vm._update(vm._render())
}

class Watcher {
  // @1
}

let watcher = new Watcher(vm, updateComponent, () => {}, {
  before () {
    if (vm._isMounted) {
      const callHook = () => {}
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)

/* eslint-disable no-unused-vars */

// #1
function constructor (vm, expOrFn /* 要观察的表达式 */, cb, options, isRenderWatcher) {
  // 数据的变化不仅仅会执行回调，还会重新对“被观察目标”求值

  // ...
  // this -> watcher
  watcher.deps = []
  watcher.newDeps = []
  watcher.depIds = new Set()
  watcher.newDepIds = new Set()
  // ...
  // getter转化为获取表达式方法
  if (typeof expOrFn === 'function') {
    watcher.getter = expOrFn
  } else {
    // this.getter = parsePath(expOrFn)
    // ...
  }
  if (watcher.computed) {
    watcher.value = undefined
    // watcher.dep = new Dep()
  } else {
    // @2
    watcher.value = get()
  }
}

// #2
// 1. 触发访问器属性的 get 拦截器函数
// 2. 获得被观察目标的值
function get () {
  // this -> watcher
  // watcher存放到了Dep.target中
  pushTarget(watcher)
  // @3
}

class Dep {}

Dep.target = null
const targetStack = []

function pushTarget (_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

// #3
// this -> watcher
let value = watcher.getter.call(vm, vm)

// 接着触发observe定义的属性拦截器 get
let observe

let dep
// 先执行pushTarget，再执行getter，所以Dep.target有值
if (Dep.target) {
  dep.depend()
}

observe.get = function () {
  dep.depend()
}

dep.depend = function () {
  if (Dep.target) {
    Dep.target.addDep(dep)
  }
}

Watcher.prototype.addDep = function (dep) {
  const id = dep.id
  // 避免一次求值中重复收集
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    // 避免多次求值中重复收集
    if (!this.depIds.has(id)) {
      // addSub就是将 watcher 放到dep中
      dep.addSub(this)
    }
  }
}

// subs是Dep中闭包引用变量
let subs = []
dep.addSub = function (watcher) {
  subs.push(watcher)
}

// 模板将通过compileToFunctions函数被编译成渲染函数render，通过mountComponent函数挂载，接着创建一个渲染函数的观察者，从而对渲染函数求值，在求值的过程中会触发数据对象 name 属性的 get 拦截器函数，进而将该观察者收集到 name 属性通过闭包引用的“筐”中，即收集到 Dep 实例对象中。这个 Dep 实例对象是属于 name 属性自身所拥有的，这样当我们尝试修改数据对象 name 属性的值时就会触发 name 属性的 set 拦截器函数，这样就有机会调用 Dep 实例对象的 notify 方法，从而触发了响应，

// observe中set
observe.set = function () {
  dep.notify()
}

dep.notify = function () {
  const subs = this.subs.slice()
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}

// 理解为将参数加入异步队列中
let queueWatcher = () => {}

Watcher.prototype.update = function () {
  if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}

// 无论同步异步，最终执行的都是run
Watcher.prototype.run = function () {
  // 这里的cb是noop，空函数
  this.getAndInvoke(this.cb)
}

Watcher.prototype.getAndInvoke = function (cb) {
  // 重新求值
  const value = this.get()
}
