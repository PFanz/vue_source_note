class Watch {

}

class Dep {
  static target
  // 收集依赖
  depend () {
  }
  // 触发依赖
  notify () {
    Dep.target()
  }
}

function def (obj, key, val, enumerable = false) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

function defineReactive (obj, key) {
  let val = obj[key]
  const { dep } = obj.__ob__
  console.log(obj)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      console.log(`触发data上变量${key}的获取`)
      // 这样就可以在这里进行依赖收集
      dep.depend()
      const value = val
      return value
    },
    set: function reactiveSetter (newVal) {
      console.log(`触发data上变量${key}的改变`)
      // 这样就可以在这里进行依赖触发
      val = newVal
      dep.notify()
    }
  })
}

class Observer {
  constructor (value) {
    this.value = value
    this.dep = new Dep()
    def(value, '__ob__', this)

    if (typeof value === 'object') {
      this.walk(value)
    }
  }

  walk (obj) {
    for (let key in obj) {
      defineReactive(obj, key)
    }
  }
}

class Vue {
  rootElement
  template
  _data

  constructor ({ el, data, template }) {
    this.rootElement = document.querySelector(el)
    this.template = template
    // data默认为方法的返回值
    this._data = data()
    // @1
    this.proxy()

    // 为_data添加__ob__，使得ob可以响应
    // eslint-disable-next-line no-new
    new Observer(this._data)
    // 所以这里直接调用render，无法将render加入到依赖中
    Dep.target = this.render.bind(this)
    this.render()
  }

  // #1 代理data，使得可以this.key可以直接访问到data中的key
  proxy () {
    const { _data } = this
    for (let key in _data) {
      Object.defineProperty(this, key, {
        get () {
          return this._data[key]
        },
        set (value) {
          this._data[key] = value
        }
      })
    }
  }

  // 渲染
  render () {
    console.log(this.text)
    const htmlString = this.template.replace(/{{(.*)}}/g, (text, key) => {
      return this[key]
    })
    console.log(this.text)
    this.rootElement.innerHTML = htmlString
  }
}

var vue = new Vue({
  el: '#app',
  data () {
    return {
      text: 'a'
    }
  },
  template: `<p>{{text}}</p>`
})

console.log(vue)
