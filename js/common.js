function intersection(setA, setB) {
    const _intersection = new Set();
    for (const elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

function parseHTML(html) {
    const temp = document.createElement('template');
    temp.innerHTML = html;
    return temp.content.firstElementChild;
}

class property {
    static callback_id = 0;

    constructor(value) {
        this.value = value;
        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push({func: callback, id: property.callback_id});
        return property.callback_id++;
    }

    unsubscribe(id) {
        const idx = this.subscribers.findIndex((sub) => sub.id === id);
        if (idx != -1) {
            this.subscribers.splice(idx, 1);
        }
    }

    set_value(value) {
        this.value = value;
        for (const sub of this.subscribers) {
            sub.func(this.value);
        }
    }

    convert_to(input) {
        input.value = this.toString();
    }

    convert_from(input) {
        throw new Error("not implemented");
    }

    toString() {
        return `${this.value}`;
    }

    validate_keypress(before, key) {
        return true;
    }
}

class str_property extends property {
    static __validate(value) {
        if (value === null) {
            throw new Error("str_property: Cannot hold null");
        }

        return `${value}`;
    }

    constructor(value = '') {
        super(str_property.__validate(value));
    }

    set_value(value) {
        super.set_value(str_property.__validate(value));
    }

    toString() {
        return this.value;
    }

    convert_from(input) {
        this.set_value(input.value);
    }
}

class int_property extends property {
    static __validate(value) {
        if (value === null) {
            throw new Error("int_property: Cannot hold null");
        }

        switch (typeof(value))
        {
            case "string":
            {
                const number_value = +value;
                if (!isNaN(number_value)) {
                    return Math.trunc(number_value);
                }
            }
            break;
            case "number":
                return Math.trunc(value);
        }
        
        throw new Error(`int_property: Unable to convert to integer: ${value}`);
    }

    constructor(value = 0) {
        super(int_property.__validate(value));
    }

    set_value(value) {
        super.set_value(int_property.__validate(value));
    }

    convert_from(input) {
        this.set_value(input.valueAsNumber);
    }

    validate_keypress(before, key) {
        if (key == '-') {
            return !key.includes('-');
        }
        
        return key >= '0' && key <= '9';
    }
}

class float_property extends property {
    static  __validate(value) {
        if (value === null) {
            throw new Error("float_property: Cannot hold null");
        }

        switch (typeof(value))
        {
            case "string":
            {
                const number_value = +value;
                if (!isNaN(number_value)) {
                    return number_value;
                }
            }
            break;
            case "number":
                return value;
        }

        throw new Error(`float_property: Unable to convert to integer: ${value}`);
    }

    constructor(value = 0) {
        super(float_property.__validate(value));
    }

    set_value(value) {
        super.set_value(float_property.__validate(value));
    }

    convert_from(input) {
        this.set_value(input.valueAsNumber);
    }

    validate_keypress(before, key) {
        if (key == '.') {
            return !before.includes('.');
        }
        if (key == '-') {
            return !key.includes('-');
        }

        return key >= '0' && key <= '9';
    }
}

class money_property extends float_property {
    static __validate(value, precision) {
        if (value === null) {
            throw new Error("money_property: Cannot hold null");
        }

        const float_value = float_property.__validate(value);
        return +float_value.toFixed(precision);
    }

    constructor(value, precision) {
        super(money_property.__validate(value, precision));
        this.precision = precision;
    }

    set_value(value) {
        super.set_value(money_property.__validate(value, this.precision));
    }

    toString() {
        return this.value.toFixed(this.precision);
    }

    validate_keypress(before, key) {
        if (key == '.') {
            return !before.includes('.');
        }
        if (key == '-') {
            return !key.includes('-');
        }

        return key >= '0' && key <= '9';
    }
}

class boolean_property extends property {
    static __validate(value) {
        if (value === null) {
            throw new Error("boolean_property: Cannot hold null");
        }

        if (typeof(value) === "boolean") {
            return value;
        }

        throw new Error(`boolean_property: Not a boolean value: ${value}`);
    }

    constructor(value) {
        super(boolean_property.__validate(value));
    }

    set_value(value) {
        super.set_value(boolean_property.__validate(value));
    }

    convert_from(input) {
        if (input.type === "checkbox") {
            this.set_value(input.checked);
        }
        else {
            this.set_value(input.value.length > 0);
        }
    }

    convert_to(input) {
        if (input.type === "checkbox") {
            input.checked = this.value;
        }
        else {
            input.value = this.value ? "1" : "";
        }
    }
}

class array_property extends property {
    constructor(value, convert_to, convert_from) {
        super(value);
        this.__convert_to = convert_to;
        this.__convert_from = convert_from;
    }

    convert_to(input) {
        if (input.type.startsWith("select")) {
            for (const option of input.options) {
                option.selected = false;
            }

            for (const item of this.value) {
                const converted = this.__convert_to(item);
                for (const option of input.options) {
                    if (option.value === converted) {
                        option.selected = true;
                        break;
                    }
                }
            }
        }
        else {
            this.set_value(this.__convert_to(value));
        }
    }

    convert_from(input) {
        if (input.type === "select-multiple") {
            let items = [];
            for (const option of input.options) {
                if (option.selected) {
                    items.push(this.__convert_from(option.value));
                }
            }
            this.set_value(items);
        }
        else {
            this.__convert_from(input, this.value);
        }
    }
}

function create_input(prop) {
    var input = document.createElement("input");
    switch (typeof(prop.value)) {
        case "number":
            input.classList.add("form-control");
            input.setAttribute("type", "number")
            break;
        case "boolean":
            input.classList.add("form-check-input");
            input.setAttribute("type", "checkbox");
            break;
        default:
            input.classList.add("form-control");
            input.setAttribute("type", "text");
    }
    prop.convert_to(input);
    prop.subscribe((value) => {
        prop.convert_to(input);
    });
    input.addEventListener("change", (event) => {
        try
        {
            prop.convert_from(event.target)
        }
        catch (error) {}
    });
    input.addEventListener("keypress", (event) => {
        if (!prop.validate_keypress(event.target.value, event.key)) {
            event.preventDefault();
        }
    });
    return input;
}

function create_select(prop, ...values) {
    var input = document.createElement("select");
    input.classList.add("form-select");

    for (const value of values) {
        const option = document.createElement("option");
        option.value = `${value}`;
        option.textContent = `${value}`;
        input.appendChild(option);
    }
    prop.convert_to(input);

    prop.subscribe((value) => {
        prop.convert_to(input);
    });
    input.addEventListener("change", (event) => {
        try
        {
            prop.convert_from(event.target);
        }
        catch (error) {}
    });
    return input;
}

function* enumerate(iterable) {
    let i = 0;

    for (const x of iterable) {
        yield [i, x];
        ++i;
    }
}

function download(data, filename, type) {
    const file = new Blob([data], {type: type});
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}