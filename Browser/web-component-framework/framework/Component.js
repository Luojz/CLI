// 双向数据绑定不适合内部嵌套其他组件的情况，当state改变时会导致嵌套的组件重新渲染
export class Component extends HTMLElement {
    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: 'closed' });

        // props属性
        const props = {}
        const atrributes = this.getAttributeNames()
        atrributes.forEach(attribute => props[attribute] = this.getAttribute(attribute))

        // 页面状态
        this.state = { ...this.data(), ...props }

        Object.keys(this.state).forEach(key => {
            const re = new RegExp(`\s\S]*\{{1}\s*/${key}`)
        })

        // 单向传递 props可传递数据、函数及更复杂的对象
        this.props = new Proxy(props, {
            set: (target, key, receiver) => {
                const retVal = Reflect.set(target, key, receiver)
                this.setState(target)
                return retVal;
            }
        })

        const template = this.template.toString()
            .match(/\`([\s\S]*)\`/)[1]
            .replace(/\s*=\s*/g, '=') // 去除等号两边空格
            .replace(/[^\>]*\{{1}[^\}]+/g, c => c.replace(/\s+/g, '')) // 去除${}内空格

        this.shadow.innerHTML = template;
        this.listen()

        this.once()
    }

    // todo: 更名为template
    template(state) { }

    data() { }

    setState(data) {
        if (typeof data === 'object') {
            Object.assign(this.state, data)
            this.shadow.innerHTML = '' // this.template(this.state);
            this.listen()
        }
    }

    // 每次状态更新，需要重新绑定
    listen() { }

    // 仅初始化完成时执行一次
    once() { }

    $(selector, isAll = false) {
        return isAll ? this.shadow.queryAllSelector(selector) : this.shadow.querySelector(selector)
    }
}