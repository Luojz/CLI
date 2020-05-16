
// docs: [HTMLElement](https://www.w3school.com.cn/xmldom/dom_htmlelement.asp)

const getAttributes = (node) => {
    const props = {}
    const atrributes = node.getAttributeNames()
    atrributes.forEach(attribute => props[attribute] = node.getAttribute(attribute))
    return props
}

class Component extends HTMLElement {
    constructor() {
        super();

        this.init()
            .then(({ data, methods }) => {
                this.create({ data, methods })
                    .then(this.mount)
            })
    }

    // @return { data, methods }
    async init() {
        return {
            data: {},
            methods: {
                fetch() { }
            }
        }
    }

    /* private */async create({ data, methods }) {
        this.shadow = this.attachShadow({ mode: 'closed' });

        this.state = data
        this.methods = methods

        const template = this.template()
            .replace(/\>\s*\</g, _ => _.replace(/\s+/g, ''))
            .replace(/\s*=\s*/g, '=')
            .replace(/\>\s*(\{[\s\S]*\})\s*\</g, _ => _.replace(/\s+/g, '')) // 去除{}空格

        this.shadow.innerHTML = template

        this.mvvm()

        this.props = new Proxy(getAttributes(this), {
            set: (target, key, receiver) => {
                const retVal = Reflect.set(target, key, receiver)
                this.update({ key: receiver })
                return retVal;
            }
        })

        this.setState(this.props)
    }

    async mount() { }

    update(data) {
        this.setState(data)
    }

    template(state) { }

    setState(data) {
        if (typeof data === 'object') {
            Object.assign(this.state, data)
            this.render()
        }
    }

    /* private */mvvm() {
        const analyze = (node) => {
            const vm = {
                node,
                attributes: {},
                listeners: {},
                dataset: {},
            }
            node.getAttributeNames().forEach(attribute => {
                if (attribute.match(/\:([a-zA-Z\-]+)/)) {
                    // 
                    vm.attributes[attribute] = node.getAttribute(attribute)
                }
                if (attribute.match(/\:([a-zA-Z\-]+)/)) {
                    // 
                    vm.dataset[attribute] = node.getAttribute(attribute)
                }
                if (attribute.match(/\@([a-zA-Z\-]+)/)) {
                    // 
                    vm.listeners[attribute] = node.getAttribute(attribute)
                }
            })
            if (node.childNodes && node.childNodes.length > 0) {
                // console.log(Array.isArray(node.childNodes))
                // vm.children = node.childNodes.map(analyze)
                vm.children = []
                for (const childNode of node.childNodes) {
                    return analyze(childNode)
                }
            }
            return vm
        }
        this.vm = analyze(this)
        console.log(this.vm)
    }

    // 根据state变化计算可变节点
    /* private */async diff() {
        return await []
    }

    /* private */async render() {
        const nodes = await this.diff()
        nodes.forEach(node => {
            const { selector, attribute, value } = node
            this.$(selector)[attribute] = value
        })
    }
}

const customElementRegister = (customs) => Object.entries(customs)
    .forEach(custom => window.customElements.define(...custom))

const isRoute = (path) => {
    const paths = (window.location.pathname || '/').split('/')
    const slugs = path.split('/')
    if (slugs.length !== paths.length) return false
    for (let i = 0; i < slugs.length; i++) {
        if (slugs[i].includes(':')) return true
        if (slugs[i] !== paths[i]) return false
    }
    return true
}

class Router extends Component {
    template(/* { routes } */) {
        return (
            `<route *for="routes" *if="isRoute(.path)" :key=".tag">{.title}</route>`
        )
    }
}
