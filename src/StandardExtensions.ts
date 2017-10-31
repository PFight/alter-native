import * as Alina from "./alina";

export interface StandardExtensions {
  query(selector: string): this;
  queryAll(selector: string, render: (context: this) => void): void;
  getEntry(entry: string): this;
  getEntries(entry: string, render: (context: this) => void): void;
  findNode(entry: string): this;
  findNodes(entry: string, render: (context: this) => void): void;
  set<T>(stub: string, value: T): void;
  showIf(templateSelector: string, value: boolean): void;
  tpl(key?: string): ITemplateProcessor<this>;
  repeat<T>(templateSelector: string, items: T[], update: (renderer: this, model: T) => void): void;
  on<T>(value: T, callback: (renderer: this, value?: T, prevValue?: T) => T | void, key?: string): void;
  once(callback: (renderer: this) => void): void;
}

export interface ITemplateProcessor<ContextT> {
  addChild<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
  setChild<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
  replace<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
}



export function StandardExt<T extends Alina.NodeContext>(renderer: T): T & StandardExtensions {
  let result = renderer as T & StandardExtensions;
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

function on<T>(this: Alina.NodeContext, value: T, callback: (renderer, value?: T, prevValue?: T) => T | void, key?: string): void {
  let context = this.getContext<Record<'lastValue', T>>(this.getKey(key, on));
  if (context.lastValue !== value) {
    let result = callback(this, value, context.lastValue) as T;
    context.lastValue = result !== undefined ? result : value;
  }
}

function once(this: Alina.NodeContext, callback: (renderer) => void): void {
  let context = this.getContext(this.getKey("", once));
  if(!context) {
    callback(this);
  }
}

function query(this: Alina.NodeContext, selector: string): any {
  return this.mount(Alina.AlQuery).query(selector);
}

function queryAll(this: Alina.NodeContext, selector: string, render: (context) => void): void {
  this.mount(Alina.AlQuery).queryAll(selector, render);
}

function getEntries(this: Alina.NodeContext, entry: string, render: (context) => void): any {
  return this.mount(Alina.AlEntry).getEntries(entry, render);
}

function getEntry(this: Alina.NodeContext, entry: string): any {
  return this.mount(Alina.AlEntry).getEntry(entry);
}

function findNode(this: Alina.NodeContext, entry: string): any {
  return this.mount(Alina.AlFind).findNode(entry);
}

function findNodes(this: Alina.NodeContext, entry: string, render: (context) => void): any {
  return this.mount(Alina.AlFind).findNodes(entry, render);
}

function set<T>(this: Alina.NodeContext, stub: string, value: T): void {
  this.mount(Alina.AlEntry).getEntries(stub, (context) => {
    context.mount(Alina.AlSet).set(value);
  });
}

function repeat<T>(this: Alina.NodeContext, templateSelector: string, items: T[], update: (renderer, model: T) => void): void {
  this.mount(Alina.AlQuery).query(templateSelector)
    .mount(Alina.AlRepeat).repeat(items, update);
}

function showIf(this: Alina.NodeContext, templateSelector: string, value: boolean): void {
  this.mount(Alina.AlQuery).query(templateSelector)
    .mount(Alina.AlShow).showIf(value);
}

function tpl(this: Alina.NodeContext, key?: string): any {
  return this.mount(Alina.AlTemplate, key);
}

