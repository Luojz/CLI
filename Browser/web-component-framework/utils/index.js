export const isType = (value, type) => typeof type === 'function'
    ? value instanceof type
    : typeof value === type

export const deepCopy = (oldObj) => {
    const list = []

    return function deepCopy(oldObj) {
        list.push(oldObj)

        const newObj = Array.isArray(oldObj) ? [] : {}

        for (const key in oldObj) {
            if (oldObj.hasOwnProperty(key)) {
                if (typeof oldObj[key] === 'object') {
                    if (list.find(item => item === oldObj[key])) {
                        console.log(`{ ${key}: [Circular] }`)
                        newObj[key] = oldObj[key]
                    } else {
                        newObj[key] = deepCopy(oldObj[key])
                    }
                } else {
                    newObj[key] = oldObj[key]
                }
            }
        }

        return newObj
    }(oldObj)
}

export const keyValues = (obj) =>
    Object.keys(obj).map(key => ({ key, value: obj[key] }))

export const keyValue = (raw) =>
    typeof raw === 'object' ? keyValues(raw)[0] : raw

export const format = (raw, fields, convert) => {
    const list = {}

    return function format(raw, fields, convert) {
        fields.forEach(field => {
            if (typeof list[field] === 'undefined') {
                list[field] = [raw]
            } else {
                list[field].push(raw)
            }
            for (const key in raw) {
                if (typeof raw[key] === 'object') {
                    if (Array.isArray(raw[key])) {
                        raw[key].forEach(item => item = format(item, [field], convert))
                    } else {
                        if (list[field].find(item => item === raw[key])) {
                            console.log(`{ ${key}: [Circular] }`)
                        } else {
                            raw[key] = format(raw[key], [field], convert)
                        }
                    }
                } else {
                    if (key === field) {
                        raw[key] = convert(raw[key])
                    }
                }
            }
        })

        return raw
    }(raw, fields, convert)
}

export const adapt = (raw, transform) => {
    const list = []

    return function adapt(raw, transform) {
        list.push(raw)

        if (Array.isArray(raw)) {
            raw.forEach(item => item = adapt(item, transform))
        } else {
            Object.keys(raw).forEach(oldKey => {
                const newKey = transform[oldKey] || oldKey

                if (newKey !== oldKey) {
                    raw[newKey] = raw[oldKey]
                    delete raw[oldKey]
                }

                if (typeof raw[newKey] === 'object') {
                    if (list.find(item => item === raw[newKey])) {
                        console.log(`{ ${newKey}: [Circular] }`)
                    } else {
                        raw[newKey] = adapt(raw[newKey], transform)
                    }
                }
            })
        }

        return raw
    }(raw, transform)
}

export const execute = (handle, task) => Array.isArray(task)
    ? task.map(handle)
    : handle(task)

export const contain = (source, target) => Object.keys(target)
    .every(key => source[key] === target[key])

export const integrate = async (rule, cause) => {
    const h = cause => rule.handle ? rule.handle(cause) : cause

    if (rule.prerequisites && rule.prerequisites.length > 0) {
        switch (rule.mode) {
            case 'serial':
                for (let i = 0; i < rule.prerequisites.length; i++) {
                    cause = await integrate(rule.prerequisites[i], cause)
                }
                return h(cause)
            case 'parallel':
            case 'select':
                const promises = rule.prerequisites.map(async (prerequisite) => await integrate(prerequisite, cause))
                const method = rule.mode === 'parallel' ? 'all' : 'race'
                return Promise[method](promises).then(h)
            default:
                throw `${rule.mode} is not one type of modes: serial, parallel, select`
        }
    } else {
        return h(cause)
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