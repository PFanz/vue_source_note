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
    const htmlString = this.template.replace(/{{(.*)}}/g, (text, key) => {
      return this[key]
    })
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
