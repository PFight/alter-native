(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.alina = {})));
}(this, (function (exports) { 'use strict';

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
function definedNotNull(x) {
    return x !== undefined && x !== null;
}
function undefinedOrNull(x) {
    return x === undefined || x === null;
}
function getIdlName(attr, node) {
    var idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
    if (!(idlName in node)) {
        idlName = null;
    }
    return idlName;
}
var ATTRIBUTE_TO_IDL_MAP = {
    "class": "className",
    "for": "htmlFor"
};

var NodeContext = (function () {
    function NodeContext(nodeOrBinding, parent) {
        this.extensions = [];
        this.init(nodeOrBinding, parent);
    }
    Object.defineProperty(NodeContext.prototype, "elem", {
        get: function () {
            return this.node;
        },
        set: function (elem) {
            this.node = elem;
        },
        enumerable: true,
        configurable: true
    });
    NodeContext.prototype.nodeAs = function () {
        return this.node;
    };
    Object.defineProperty(NodeContext.prototype, "node", {
        get: function () {
            return this.getNode();
        },
        set: function (node) {
            this.setNode(node);
        },
        enumerable: true,
        configurable: true
    });
    NodeContext.prototype.create = function (nodeOrBinding) {
        var inst = new NodeContext(nodeOrBinding, this);
        for (var _i = 0, _a = this.extensions; _i < _a.length; _i++) {
            var ext = _a[_i];
            inst = ext(inst);
        }
        return inst;
    };
    Object.defineProperty(NodeContext.prototype, "binding", {
        get: function () {
            return this._binding;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeContext.prototype, "parent", {
        get: function () {
            return this.parentRenderer;
        },
        enumerable: true,
        configurable: true
    });
    NodeContext.prototype.getContext = function (key, createContext) {
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = createContext ? createContext() : {};
        }
        return context;
    };
    NodeContext.prototype.ext = function (createExtension) {
        var _this = this;
        var key = this.getKey("", createExtension);
        var context = this.getContext(key, function () {
            _this.extensions.push(createExtension);
            return { extension: createExtension(_this) };
        });
        return context.extension;
    };
    NodeContext.prototype.mount = function (componentCtor, key) {
        var _this = this;
        var componentKey = this.getKey(key, componentCtor);
        var context = this.getContext(componentKey, function () {
            var instance = new componentCtor();
            instance.initialize(_this);
            return { instance: instance };
        });
        return context.instance;
    };
    NodeContext.prototype.call = function (component, props, key) {
        var _this = this;
        var componentKey = this.getKey(key, component);
        var context = this.getContext(componentKey, function () { return ({
            renderer: _this.create(_this.binding)
        }); });
        return component(context.renderer, props);
    };
    NodeContext.prototype.getKey = function (key, component) {
        var result = key || "";
        if (component["AlinaComponentName"]) {
            result += component["AlinaComponentName"];
        }
        else {
            var name_1 = component["AlinaComponentName"] =
                (component["name"] || "") + COMPONENT_KEY_COUNTER.toString();
            COMPONENT_KEY_COUNTER++;
            result += name_1;
        }
        return result;
    };
    NodeContext.prototype.init = function (nodeOrBinding, parent) {
        if (nodeOrBinding.nodeType !== undefined) {
            this._binding = {
                node: nodeOrBinding,
                queryType: exports.QueryType.Node
            };
        }
        else {
            this._binding = nodeOrBinding;
        }
        this.context = {};
        this.parentRenderer = parent;
        if (parent) {
            this.extensions = parent.extensions.slice();
        }
    };
    NodeContext.prototype.getNode = function () {
        return this._binding.node;
    };
    NodeContext.prototype.setNode = function (node) {
        if (!this._binding) {
            this._binding = {};
        }
        var oldVal = this._binding.node;
        if (oldVal != node) {
            this._binding.node = node;
            this._binding.queryType = exports.QueryType.Node;
            if (this.parentRenderer && this.parentRenderer.node == oldVal) {
                this.parentRenderer.node = node;
            }
        }
    };
    return NodeContext;
}());
;
(function (QueryType) {
    QueryType[QueryType["Node"] = 1] = "Node";
    QueryType[QueryType["NodeAttribute"] = 2] = "NodeAttribute";
    QueryType[QueryType["NodeTextContent"] = 3] = "NodeTextContent";
})(exports.QueryType || (exports.QueryType = {}));
var COMPONENT_KEY_COUNTER = 1;

var Component = (function () {
    function Component() {
    }
    Component.prototype.initialize = function (context) {
        this.root = context;
    };
    return Component;
}());

var __extends = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlinaComponent = (function (_super) {
    __extends(AlinaComponent, _super);
    function AlinaComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AlinaComponent;
}(Component));

var Document = new NodeContext(document, null).ext(StandardExt);

var __extends$1 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var undefinedOrNull$1 = undefinedOrNull;
var definedNotNull$1 = definedNotNull;
var AlRepeat = (function (_super) {
    __extends$1(AlRepeat, _super);
    function AlRepeat() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.itemContexts = [];
        return _this;
    }
    AlRepeat.prototype.repeat = function (items, update, options) {
        if (update) {
            this.context = {
                template: this.root.elem,
                container: this.root.elem.parentElement,
                insertBefore: this.root.elem,
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
                itemContext.renderer = this.root.create(node);
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
}(AlinaComponent));

var __extends$2 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlSet = (function (_super) {
    __extends$2(AlSet, _super);
    function AlSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlSet.prototype.set = function (value) {
        if (this.lastValue !== value) {
            var preparedValue = value;
            var binding = this.root.binding;
            // Initial value is stub text (query)
            var lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
            if (binding.queryType == exports.QueryType.NodeAttribute) {
                // Class names should be separated with space         
                if (binding.attributeName == "class") {
                    preparedValue = (!value) ? "" : value + " ";
                }
                // Some attributes has corresponding idl, some doesn't.
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
            this.lastValue = preparedValue;
        }
    };
    return AlSet;
}(AlinaComponent));

var __extends$3 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlShow = (function (_super) {
    __extends$3(AlShow, _super);
    function AlShow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlShow.prototype.showIf = function (value) {
        if (this.lastValue !== value) {
            var templateElem = this.root.nodeAs();
            var node = this.node;
            if (value) {
                if (!node) {
                    node = this.node = fromTemplate(templateElem);
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
            this.lastValue = value;
        }
    };
    return AlShow;
}(AlinaComponent));

var __extends$4 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlTemplate = (function (_super) {
    __extends$4(AlTemplate, _super);
    function AlTemplate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlTemplate.prototype.addChild = function (template, render) {
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
    AlTemplate.prototype.setChild = function (template, render) {
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
    AlTemplate.prototype.replace = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            var parent_1 = this.root.elem.parentElement;
            if (parent_1) {
                parent_1.replaceChild(this.result.elem, this.root.elem);
            }
            this.root.elem = this.result.elem;
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    //protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[] {
    //  return templateElem.content ?
    //    [].map.call(templateElem.content.children, (node) => node.cloneNode(true))
    //    :
    //    [].map.call(templateElem.children, (node) => node.cloneNode(true))
    //}
    AlTemplate.prototype.instantiateTemplateOne = function (templateElem) {
        return fromTemplate(templateElem);
    };
    return AlTemplate;
}(AlinaComponent));

var __extends$5 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlQuery = (function (_super) {
    __extends$5(AlQuery, _super);
    function AlQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlQuery.prototype.query = function (selector) {
        var _this = this;
        var context = this.root.getContext(selector, function () { return ({
            result: _this.root.create(_this.querySelectorInternal(selector))
        }); });
        return context.result;
    };
    AlQuery.prototype.queryAll = function (selector, render) {
        var _this = this;
        var context = this.root.getContext(selector, function () { return ({
            contexts: _this.querySelectorAllInternal(selector).map(function (x) { return _this.root.create({
                node: x,
                queryType: exports.QueryType.Node,
                query: selector
            }); })
        }); });
        for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
            var c = _a[_i];
            render(c);
        }
    };
    AlQuery.prototype.querySelectorInternal = function (selector) {
        var result;
        if (this.root.node.nodeType == Node.ELEMENT_NODE) {
            var elem = this.root.node;
            if (elem.matches(selector)) {
                result = elem;
            }
            else {
                result = elem.querySelector(selector);
            }
        }
        return result;
    };
    AlQuery.prototype.querySelectorAllInternal = function (selector) {
        var result = [];
        var node = this.root.node;
        if (node.nodeType == Node.ELEMENT_NODE) {
            var elem = node;
            if (elem.matches(selector)) {
                result.push(elem);
            }
            result = result.concat(elem.querySelectorAll(selector));
        }
        return result;
    };
    return AlQuery;
}(AlinaComponent));

var __extends$6 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlEntry = (function (_super) {
    __extends$6(AlEntry, _super);
    function AlEntry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlEntry.prototype.getEntries = function (entry, render) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.getEntiresInternal(_this.root.node, entry, bindings, false);
            return { contexts: bindings.map(function (x) { return _this.root.create(x); }) };
        });
        for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
            var c = _a[_i];
            render(c);
        }
    };
    AlEntry.prototype.getEntry = function (entry) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.getEntiresInternal(_this.root.node, entry, bindings, true);
            return { nodeContext: _this.root.create(bindings[0]) };
        });
        return context.nodeContext;
    };
    AlEntry.prototype.getEntiresInternal = function (node, query, bindings, single, queryType) {
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
                        idlName: getIdlName(attr, node),
                        queryType: exports.QueryType.NodeAttribute
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            var lengthBefore = node.childNodes.length;
            this.getEntiresInternal(node.childNodes[i], query, bindings, single, queryType);
            var lengthAfter = node.childNodes.length;
            // Node can be replaced by several other nodes
            if (lengthAfter > lengthBefore) {
                i += lengthAfter - lengthBefore;
            }
        }
    };
    return AlEntry;
}(AlinaComponent));

var __extends$7 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlFind = (function (_super) {
    __extends$7(AlFind, _super);
    function AlFind() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlFind.prototype.findNode = function (entry) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.findNodesInternal(_this.root.node, entry, bindings, true);
            return { nodeContext: _this.root.create(bindings[0]) };
        });
        return context.nodeContext;
    };
    AlFind.prototype.findNodes = function (entry, render) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.findNodesInternal(_this.root.node, entry, bindings, false);
            return { contexts: bindings.map(function (x) { return _this.root.create(x); }) };
        });
        for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
            var c = _a[_i];
            render(c);
        }
    };
    AlFind.prototype.findNodesInternal = function (node, query, bindings, single) {
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
                        idlName: getIdlName(attr, node),
                        queryType: exports.QueryType.Node
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            this.findNodesInternal(node.childNodes[i], query, bindings, single);
        }
    };
    return AlFind;
}(AlinaComponent));

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

function StandardExt(renderer) {
    var result = renderer;
    result.query = query;
    result.queryAll = queryAll;
    result.getEntry = getEntry;
    result.getEntries = getEntries;
    result.findNode = findNode;
    result.findNodes = findNodes;
    result.set = set;
    result.showIf = showIf;
    result.tpl = tpl;
    result.repeat = repeat;
    result.on = on;
    result.once = once;
    return result;
}
function on(value, callback, key) {
    var context = this.getContext(this.getKey(key, on));
    if (context.lastValue !== value) {
        var result = callback(this, value, context.lastValue);
        context.lastValue = result !== undefined ? result : value;
    }
}
function once(callback) {
    var context = this.getContext(this.getKey("", once));
    if (!context) {
        callback(this);
    }
}
function query(selector) {
    return this.mount(AlQuery).query(selector);
}
function queryAll(selector, render) {
    this.mount(AlQuery).queryAll(selector, render);
}
function getEntries(entry, render) {
    return this.mount(AlEntry).getEntries(entry, render);
}
function getEntry(entry) {
    return this.mount(AlEntry).getEntry(entry);
}
function findNode(entry) {
    return this.mount(AlFind).findNode(entry);
}
function findNodes(entry, render) {
    return this.mount(AlFind).findNodes(entry, render);
}
function set(stub, value) {
    this.mount(AlEntry).getEntries(stub, function (context) {
        context.mount(AlSet).set(value);
    });
}
function repeat(templateSelector, items, update) {
    this.mount(AlQuery).query(templateSelector)
        .mount(AlRepeat).repeat(items, update);
}
function showIf(templateSelector, value) {
    this.mount(AlQuery).query(templateSelector)
        .mount(AlShow).showIf(value);
}
function tpl(key) {
    return this.mount(AlTemplate, key);
}

exports.makeTemplate = makeTemplate;
exports.fromTemplate = fromTemplate;
exports.definedNotNull = definedNotNull;
exports.undefinedOrNull = undefinedOrNull;
exports.getIdlName = getIdlName;
exports.ATTRIBUTE_TO_IDL_MAP = ATTRIBUTE_TO_IDL_MAP;
exports.NodeContext = NodeContext;
exports.Component = Component;
exports.AlinaComponent = AlinaComponent;
exports.Document = Document;
exports.AlRepeat = AlRepeat;
exports.AlSet = AlSet;
exports.AlShow = AlShow;
exports.AlTemplate = AlTemplate;
exports.AlQuery = AlQuery;
exports.AlEntry = AlEntry;
exports.AlFind = AlFind;
exports.Slot = Slot;
exports.StandardExt = StandardExt;

Object.defineProperty(exports, '__esModule', { value: true });

})));
