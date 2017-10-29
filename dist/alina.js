(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.alina = {})));
}(this, (function (exports) { 'use strict';

;
(function (QueryType) {
    QueryType[QueryType["Node"] = 1] = "Node";
    QueryType[QueryType["NodeAttribute"] = 2] = "NodeAttribute";
    QueryType[QueryType["NodeTextContent"] = 3] = "NodeTextContent";
})(exports.QueryType || (exports.QueryType = {}));
var Slot = (function () {
    function Slot(component) {
        this.component = component;
    }
    Slot.prototype.set = function (val) {
        this.value = val;
        return this.component;
    };
    return Slot;
}());
function makeTemplate(str) {
    var elem = document.createElement("template");
    elem.innerHTML = str.trim();
    // document.body.appendChild(elem);
    return elem;
}
function fromTemplate(templateElem) {
    return templateElem.content ?
        (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
        :
            (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
}
function replaceFromTempalte(elemToReplace, templateElem) {
    var elem = fromTemplate(templateElem);
    var parent = elemToReplace.parentElement;
    if (parent) {
        parent.replaceChild(elem, elemToReplace);
    }
    return elem;
}
function definedNotNull(x) {
    return x !== undefined && x !== null;
}
function undefinedOrNull(x) {
    return x === undefined || x === null;
}
var Renderer = (function () {
    function Renderer(nodesOrBindings, parent) {
        if (nodesOrBindings.length > 0) {
            var first = nodesOrBindings[0];
            if (first.nodeType !== undefined) {
                this._bindings = nodesOrBindings.map(function (x) { return ({
                    node: x,
                    queryType: exports.QueryType.Node
                }); });
            }
            else {
                this._bindings = nodesOrBindings;
            }
        }
        else {
            this._bindings = [];
        }
        this.context = {};
        this.parentRenderer = parent;
    }
    Renderer.Create = function (nodeOrBinding) {
        return Renderer.Main.create(nodeOrBinding);
    };
    Renderer.CreateMulti = function (nodesOrBindings) {
        return Renderer.Main.createMulti(nodesOrBindings);
    };
    Object.defineProperty(Renderer.prototype, "nodes", {
        get: function () {
            return this._bindings.map(function (x) { return x.node; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "bindings", {
        get: function () {
            return this._bindings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "elem", {
        get: function () {
            return this.node;
        },
        set: function (elem) {
            this.node = elem;
        },
        enumerable: true,
        configurable: true
    });
    Renderer.prototype.nodeAs = function () {
        return this.node;
    };
    Object.defineProperty(Renderer.prototype, "node", {
        get: function () {
            return this._bindings.length > 0 && this._bindings[0].node || null;
        },
        set: function (node) {
            var binding = this._bindings[0];
            if (!binding) {
                binding = this._bindings[0] = {};
            }
            binding.node = node;
            binding.queryType = exports.QueryType.Node;
        },
        enumerable: true,
        configurable: true
    });
    Renderer.prototype.create = function (nodeOrBinding) {
        return new Renderer([nodeOrBinding], this);
    };
    Renderer.prototype.createMulti = function (nodesOrBindings) {
        return new Renderer(nodesOrBindings, this);
    };
    Object.defineProperty(Renderer.prototype, "binding", {
        get: function () {
            return this._bindings[0];
        },
        enumerable: true,
        configurable: true
    });
    Renderer.prototype.getContext = function (key, createContext) {
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = createContext ? createContext() : {};
        }
        return context;
    };
    Renderer.prototype.mount = function (componentCtor, key) {
        var componentKey = this.getComponentKey(key, componentCtor);
        var context = this.getContext(componentKey);
        if (!context.instance) {
            var sameAsParent = this.parentRenderer && this.parentRenderer.node == this.node;
            context.instance = new componentCtor();
            context.instance.initialize(this);
            // Component can replace current node
            if (sameAsParent && this.parentRenderer.node != this.node) {
                this.parentRenderer.node = this.node;
            }
        }
        return context.instance;
    };
    Renderer.prototype.query = function (selector) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {
                result: this.create(this.querySelectorInternal(selector))
            };
        }
        return context.result;
    };
    Renderer.prototype.queryAll = function (selector) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {
                result: this.createMulti(this.querySelectorAllInternal(selector).map(function (x) { return ({
                    node: x,
                    queryType: exports.QueryType.Node,
                    query: selector
                }); }))
            };
        }
        return context.result;
    };
    Renderer.prototype.getEntries = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_1 = [];
            this._bindings.forEach(function (x) { return _this.fillBindings(x.node, entry, bindings_1, false); });
            context.renderer = this.createMulti(bindings_1);
        }
        return context.renderer;
    };
    Renderer.prototype.getEntry = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_2 = [];
            this._bindings.forEach(function (x) { return _this.fillBindings(x.node, entry, bindings_2, true); });
            context.renderer = this.create(bindings_2[0]);
        }
        return context.renderer;
    };
    Renderer.prototype.findNode = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_3 = [];
            this._bindings.forEach(function (x) { return _this.findNodesInternal(x.node, entry, bindings_3, true); });
            context.renderer = this.create(bindings_3[0]);
        }
        return context.renderer;
    };
    Renderer.prototype.findNodes = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_4 = [];
            this._bindings.forEach(function (x) { return _this.findNodesInternal(x.node, entry, bindings_4, false); });
            context.renderer = this.createMulti(bindings_4);
        }
        return context.renderer;
    };
    Renderer.prototype.on = function (value, callback, key) {
        var lastValue = key ? this.context[key] : this.onLastValue;
        if (this.onLastValue !== value) {
            var result = callback(this, value, this.onLastValue);
            var lastValue_1 = result !== undefined ? result : value;
            if (key) {
                this.context[key] = lastValue_1;
            }
            else {
                this.onLastValue = lastValue_1;
            }
        }
    };
    Renderer.prototype.once = function (callback) {
        if (!this.onceFlag) {
            this.onceFlag = true;
            callback(this);
        }
    };
    Renderer.prototype.set = function (stub, value) {
        this.getEntry(stub).mount(AlSet).set(value);
    };
    Renderer.prototype.repeat = function (templateSelector, items, update) {
        this.query(templateSelector).mount(AlRepeat).repeat(items, update);
    };
    Renderer.prototype.showIf = function (templateSelector, value) {
        this.query(templateSelector).mount(AlShow).showIf(value);
    };
    Renderer.prototype.tpl = function (key) {
        return this.mount(AlTemplate, key);
    };
    Renderer.prototype.ext = function (createExtension) {
        var key = this.getComponentKey("", createExtension);
        var context = this.getContext(key);
        if (!context.extension) {
            context.extension = createExtension(this);
        }
        return context.extension;
    };
    Renderer.prototype.querySelectorInternal = function (selector) {
        var result;
        for (var i = 0; i < this._bindings.length && !result; i++) {
            var node = this._bindings[i].node;
            if (node.nodeType == Node.ELEMENT_NODE) {
                var elem = node;
                if (elem.matches(selector)) {
                    result = elem;
                }
                else {
                    result = elem.querySelector(selector);
                }
            }
        }
        return result;
    };
    Renderer.prototype.querySelectorAllInternal = function (selector) {
        var result = [];
        for (var i = 0; i < this._bindings.length && !result; i++) {
            var node = this._bindings[i].node;
            if (node.nodeType == Node.ELEMENT_NODE) {
                var elem = node;
                if (elem.matches(selector)) {
                    result.push(elem);
                }
                result = result.concat(elem.querySelectorAll(selector));
            }
        }
        return result;
    };
    Renderer.prototype.fillBindings = function (node, query, bindings, single, queryType) {
        if (queryType === undefined || queryType == exports.QueryType.NodeTextContent) {
            if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
                var parts = node.textContent.split(query);
                if (parts.length > 1) {
                    // Split content, to make stub separate node 
                    // and save this node to context.stubNodes
                    var nodeParent = node.parentNode;
                    for (var i = 0; i < parts.length - 1; i++) {
                        var part = parts[i];
                        if (part.length > 0) {
                            nodeParent.insertBefore(document.createTextNode(part), node);
                        }
                        var stubNode = document.createTextNode(query);
                        if (!single || bindings.length == 0) {
                            bindings.push({
                                node: stubNode,
                                queryType: exports.QueryType.NodeTextContent,
                                query: query
                            });
                        }
                        nodeParent.insertBefore(stubNode, node);
                    }
                    var lastPart = parts[parts.length - 1];
                    if (lastPart && lastPart.length > 0) {
                        nodeParent.insertBefore(document.createTextNode(lastPart), node);
                    }
                    nodeParent.removeChild(node);
                }
            }
        }
        if ((queryType === undefined || queryType == exports.QueryType.NodeAttribute) && node.attributes) {
            for (var i = 0; i < node.attributes.length && (!single || bindings.length == 0); i++) {
                var attr = node.attributes[i];
                if (attr.value && attr.value.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        attributeName: attr.name,
                        idlName: this.getIdlName(attr, node),
                        queryType: exports.QueryType.NodeAttribute
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            var lengthBefore = node.childNodes.length;
            this.fillBindings(node.childNodes[i], query, bindings, single, queryType);
            var lengthAfter = node.childNodes.length;
            // Node can be replaced by several other nodes
            if (lengthAfter > lengthBefore) {
                i += lengthAfter - lengthBefore;
            }
        }
    };
    Renderer.prototype.findNodesInternal = function (node, query, bindings, single) {
        var found = false;
        if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
            if (node.textContent.indexOf(query) >= 0) {
                bindings.push({
                    node: node,
                    query: query,
                    queryType: exports.QueryType.Node
                });
                found = true;
            }
        }
        if (!found && node.attributes) {
            for (var i = 0; i < node.attributes.length && !found; i++) {
                var attr = node.attributes[i];
                if (attr.name.indexOf(query) >= 0 || attr.value.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        attributeName: attr.name,
                        idlName: this.getIdlName(attr, node),
                        queryType: exports.QueryType.Node
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            this.findNodesInternal(node.childNodes[i], query, bindings, single);
        }
    };
    Renderer.prototype.getIdlName = function (attr, node) {
        var idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
        if (!(idlName in node)) {
            idlName = null;
        }
        return idlName;
    };
    Renderer.prototype.getComponentKey = function (key, component) {
        var result = key || "";
        if (component["name"]) {
            result += component["name"];
        }
        else {
            result += this.hashCode(component.toString());
        }
        return result;
    };
    Renderer.prototype.hashCode = function (str) {
        var hash = 0, i, chr;
        if (str.length === 0)
            return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
    
    Renderer.Main = new Renderer([document.body], null);
    return Renderer;
}());
var ATTRIBUTE_TO_IDL_MAP = {
    "class": "className",
    "for": "htmlFor"
};

var undefinedOrNull$1 = undefinedOrNull;
var definedNotNull$1 = undefinedOrNull;
var AlRepeat = (function () {
    function AlRepeat() {
        this.itemContexts = [];
    }
    AlRepeat.prototype.initialize = function (context) {
        this.renderer = context;
    };
    AlRepeat.prototype.repeat = function (items, update, options) {
        if (update) {
            this.context = {
                template: this.renderer.elem,
                container: this.renderer.elem.parentElement,
                insertBefore: this.renderer.elem,
                equals: options && options.equals,
                update: update
            };
        }
        this.repeatEx(items, this.context);
    };
    AlRepeat.prototype.repeatEx = function (items, context) {
        if (context) {
            this.context = context;
        }
        var props = this.context;
        // Add new and update existing
        for (var i = 0; i < items.length; i++) {
            var modelItem = items[i];
            // Createcontext
            var itemContext = this.itemContexts[i];
            if (!itemContext || !this.compare(modelItem, itemContext.oldModelItem, props.equals)) {
                itemContext = this.itemContexts[i] = {};
            }
            // Create node
            if (!itemContext.renderer) {
                var node = fromTemplate(props.template);
                itemContext.renderer = this.renderer.create(node);
            }
            // Fill content
            props.update(itemContext.renderer, modelItem);
            // Insert to parent
            if (!itemContext.mounted) {
                var position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].renderer.node.nextSibling;
                if (position) {
                    props.container.insertBefore(itemContext.renderer.node, position);
                }
                else {
                    props.container.appendChild(itemContext.renderer.node);
                }
                itemContext.mounted = true;
            }
            itemContext.oldModelItem = modelItem;
        }
        // Remove old
        var firstIndexToRemove = items.length;
        for (var i = firstIndexToRemove; i < this.itemContexts.length; i++) {
            var elem = this.itemContexts[i].renderer.node;
            if (elem) {
                props.container.removeChild(elem);
            }
        }
        this.itemContexts.splice(firstIndexToRemove, this.itemContexts.length - firstIndexToRemove);
    };
    AlRepeat.prototype.compare = function (a, b, comparer) {
        return (undefinedOrNull$1(a) && undefinedOrNull$1(b)) ||
            (definedNotNull$1(a) && definedNotNull$1(b) && !comparer) ||
            (definedNotNull$1(a) && definedNotNull$1(b) && comparer && comparer(a, b));
    };
    return AlRepeat;
}());

var AlSet = (function () {
    function AlSet() {
    }
    AlSet.prototype.initialize = function (context) {
        this.root = context;
    };
    AlSet.prototype.set = function (value) {
        if (this.lastValue !== value) {
            var preparedValue = value;
            for (var _i = 0, _a = this.root.bindings; _i < _a.length; _i++) {
                var binding = _a[_i];
                // Initial value is stub text (query)
                var lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
                if (binding.queryType == exports.QueryType.NodeAttribute) {
                    // Class names should be separated with space         
                    if (binding.attributeName == "class") {
                        preparedValue = (!value) ? "" : value + " ";
                    }
                    // Some attributes has corresponding idl, some doesnt.
                    if (binding.idlName) {
                        var currentVal = binding.node[binding.idlName];
                        if (typeof (currentVal) == "string") {
                            binding.node[binding.idlName] = currentVal.replace(lastValue, preparedValue);
                        }
                        else {
                            binding.node[binding.idlName] = preparedValue;
                        }
                    }
                    else {
                        var elem = binding.node;
                        var currentVal = elem.getAttribute(binding.attributeName);
                        elem.setAttribute(binding.attributeName, currentVal.replace(lastValue, preparedValue));
                    }
                }
                else {
                    binding.node.textContent = binding.node.textContent.replace(lastValue, value);
                }
            }
            
            this.lastValue = preparedValue;
        }
    };
    AlSet.prototype.reset = function (value) {
        if (this.lastValue !== value) {
            for (var _i = 0, _a = this.root.bindings; _i < _a.length; _i++) {
                var binding = _a[_i];
                if (binding.queryType == exports.QueryType.NodeAttribute) {
                    if (binding.idlName) {
                        binding.node[binding.idlName] = value;
                    }
                    else {
                        var elem = binding.node;
                        elem.setAttribute(binding.attributeName, value);
                    }
                }
                else {
                    binding.node.textContent = value;
                }
            }
            this.lastValue = value;
        }
    };
    return AlSet;
}());

var AlShow = (function () {
    function AlShow() {
        this.nodes = [];
    }
    AlShow.prototype.initialize = function (context) {
        this.root = context;
    };
    AlShow.prototype.showIf = function (value) {
        if (this.lastValue !== value) {
            for (var i = 0; i < this.root.bindings.length; i++) {
                var templateElem = this.root.bindings[i].node;
                var node = this.nodes[i];
                if (value) {
                    if (!node) {
                        node = this.nodes[i] = fromTemplate(templateElem);
                    }
                    if (!node.parentElement) {
                        templateElem.parentElement.insertBefore(node, templateElem);
                    }
                }
                else {
                    if (node && node.parentElement) {
                        node.parentElement.removeChild(node);
                    }
                }
            }
            this.lastValue = value;
        }
    };
    return AlShow;
}());

var AlTemplate = (function () {
    function AlTemplate() {
    }
    AlTemplate.prototype.initialize = function (context) {
        this.root = context;
    };
    AlTemplate.prototype.appendChildren = function (template, render) {
        if (!this.result) {
            this.result = this.root.createMulti(this.instantiateTemplate(template));
            var ret = render(this.result);
            for (var _i = 0, _a = this.result.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                this.root.elem.appendChild(node);
            }
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.appendChild = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.replaceChildren = function (template, render) {
        if (!this.result) {
            this.result = this.root.createMulti(this.instantiateTemplate(template));
            var ret = render(this.result);
            var rootElem = this.root.elem;
            rootElem.innerHTML = "";
            for (var _i = 0, _a = this.result.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                rootElem.appendChild(node);
            }
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.replaceChild = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            this.root.elem.innerHTML = "";
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.instantiateTemplate = function (templateElem) {
        return templateElem.content ?
            [].map.apply(templateElem.content.children, function (node) { return node.cloneNode(true); })
            :
                [].map.apply(templateElem.children, function (node) { return node.cloneNode(true); });
    };
    AlTemplate.prototype.instantiateTemplateOne = function (templateElem) {
        return templateElem.content ?
            (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
            :
                (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
    };
    return AlTemplate;
}());

exports.Slot = Slot;
exports.makeTemplate = makeTemplate;
exports.fromTemplate = fromTemplate;
exports.replaceFromTempalte = replaceFromTempalte;
exports.definedNotNull = definedNotNull;
exports.undefinedOrNull = undefinedOrNull;
exports.Renderer = Renderer;
exports.ATTRIBUTE_TO_IDL_MAP = ATTRIBUTE_TO_IDL_MAP;
exports.AlRepeat = AlRepeat;
exports.AlSet = AlSet;
exports.AlShow = AlShow;
exports.AlTemplate = AlTemplate;

Object.defineProperty(exports, '__esModule', { value: true });

})));
