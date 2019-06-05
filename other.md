mountComponent函数

触发beforeMount

vm._render 函数的作用是调用 vm.$options.render 函数并返回生成的虚拟节点(vnode)
vm._update 函数的作用是把 vm._render 函数生成的虚拟节点渲染成真正的 DOM