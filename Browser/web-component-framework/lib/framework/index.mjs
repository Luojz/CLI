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

        // 单向传递 props可传递数据、函数及更复杂的对象
        this.props = new Proxy(props, {
            set: (target, key, receiver) => {
                const retVal = Reflect.set(target, key, receiver)
                this.setState(target)
                return retVal;
            }
        })

        this.shadow.innerHTML = this.render(this.state);
        this.listen()

        this.once()
    }


    render(state) { }

    data() { }

    setState(data) {
        if (typeof data === 'object') {
            Object.assign(this.state, data)
            this.shadow.innerHTML = this.render(this.state);
            this.listen()
        }
    }

    // 每次状态更新，需要重新绑定
    listen() { }

    // 仅初始化完成时执行一次
    once() { }

    $(selector) {
        return this.shadow.querySelector(selector)
    }
}

export const customElementRegister = (customs) => Object.entries(customs)
    .forEach(custom => window.customElements.define(...custom))

export const isRoute = (path) => {
    const paths = (window.location.pathname || '/').split('/')
    const slugs = path.split('/')
    if (slugs.length !== paths.length) return false
    for (let i = 0; i < slugs.length; i++) {
        if (slugs[i].includes(':')) return true
        if (slugs[i] !== paths[i]) return false
    }
    return true
}

export class Router extends Component {
    render({ routes }) {
        return routes
            .map(({ path, tag, title }) => isRoute(path) ? `<${tag} title="${title}"></${tag}>` : '')
            .join('')
    }
}

export const attrs = (properties, mode = false) => {
    if (mode) {
        const attributes = {}
        properties.trim().replace(/[\'\"]/g, '').split(/\s+/)
            .forEach(property => {
                const [attribute, value] = property.split('=')
                attributes[attribute] = value
            })
        return attributes
    } else {
        return Object.entries(properties)
            .map(([attribute, value]) => `${attribute}="${value}"`)
            .join(' ')
    }
}

export const html = (raw, mode = false) => {
    if (mode) {
        // 先区分tag property 
        // 再处理children 
        // const words = text.split(/[\b]*)/g)
        // for (let i = 0; i < words.length; i++) {
        //     const word = words[i]
        //     const p = word.indexOf('=')
        //     if (p == -1) {
        //         return word.replace(/[><\/]*/g, '')
        //     } else {
        //         return [word.slice(0, p), word.slice(p)]
        //     }
        // }

    } else {
        const h = ({ render, params, text }) => render ? render(params) : text || ''
        if (Array.isArray(raw)) {
            return raw.map(html).join('')
        } else {
            const { tag, properties, children } = raw
            return `<${tag} ${attrs(properties)}>${children ? html(children) : h(raw)}</${tag}>`
        }
    }
}

export const noop = (...params) => { }