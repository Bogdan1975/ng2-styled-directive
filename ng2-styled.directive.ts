/**
 * Created by Targus on 05.05.2016.
 * @author Bogdan Shapoval (targus) <it.targus@gmail.com>
 */

import {Directive, Input, ElementRef, ViewContainerRef} from 'angular2/core';

interface IConfigItem {
    path?: string;
    block?: Array<string>|string;
}
export interface IStyledConfig {
    [index:string]: IConfigItem
}

export interface ISkinable {
    getStyledConfig(): IStyledConfig;
}

@Directive({
    selector: '[styled]'
})
export class Ng2StyledDirective {

    @Input() stylePath: string = null;
    @Input() styleBlock: Array<string> | string = null;
    @Input() skin:string;

    private _config: IStyledConfig = {};

    constructor(private el:ElementRef, private _view: ViewContainerRef) {}

    ngAfterViewInit() {

        // get component instance in case directive was applied to component
        var component = (<any>this._view)._element.component;

        // check for skin settings method in parent component
        if (typeof(component) == 'object' && typeof(component.getStyledConfig) == 'function' && this.skin != 'none') {
            this._config = <IStyledConfig>component.getStyledConfig();
        }

        if (this.skin != 'none') {
            if (!this.skin || !this._config[this.skin]) this.skin = 'default';
            if (this._config[this.skin] && typeof(this._config[this.skin].path) != 'undefined' && this._config[this.skin].path) {
                this.setStylePath(this._config[this.skin].path);
            }
        }
        if (this.stylePath) {
            this.setStylePath(this.stylePath);
        }

        var block = [];
        if (this.skin != 'none') {
            if (!this.skin || !this._config[this.skin]) this.skin = 'default';
            if (this._config[this.skin] && typeof(this._config[this.skin].block) != 'undefined' && this._config[this.skin].block) {
                let style = this._config[this.skin].block;
                if (typeof(style) == 'object' && style instanceof Array) {
                    block = style;
                } else if (typeof(style) == 'string') {
                    block.push(style);
                }
                // this.setStyleBlock(this._config[this.skin].block);
            }
        }
        if (this.styleBlock) {
            let style = this.styleBlock;
            if (typeof(style) == 'object' && style instanceof Array) {
                block = block.concat(style);
            } else if (typeof(style) == 'string') {
                block.push(style);
            }
            // this.setStyleBlock(this.styleBlock);
        }
        if (block.length) {
            this.setStyleBlock(block);
        }

    }

    setStyleBlock(style: any) {
        if (typeof(style) == 'string') {
            this.setStyleForElement(style);
        }
        if (typeof(style) == 'object' && style instanceof Array) {
            this.setStyleForElement(style);
        }
    }

    getIdentityAttribute() {
        for (let attr of this.el.nativeElement.attributes) {
            if (/^_nghost/.test(attr.name) || /^_ngcontent/.test(attr.name) || /^_styled/.test(attr.name)) {
                return attr.name;
            }
        }
        return false;
    }
    
    setArrayStylesForElement(styles: Array<string>) {
        for (let style of styles) {
            this.setStyleForElement(style);
        }
    }

    setStyleForElement(styles: string | Array<string>) {
        // get styling encapsulation attribute
        var idAttr = this.getIdentityAttribute();
        // create own encapsulation attribute, if not exist
        if (!idAttr) {
            idAttr = '_styled-'+Math.random().toString(36).slice(2, 6);
            this.el.nativeElement.setAttribute(idAttr,'');
        }

        // get or create <style id="styled-directive-block"> element
        var styleElList = document.querySelectorAll('style#styled-directive-block');
        var styleEl:any;
        if (!styleElList.length) {
            styleEl = document.createElement('style');
            styleEl.type = 'text/css';
            styleEl.id = 'styled-directive-block';
        } else {
            styleEl = styleElList[0];
        }

        // ctreating css style block for current element
        var stylesArray = (typeof(styles) == 'string') ? [styles] : styles;
        var styleString = '';
        for (let style of stylesArray) {
            if (!style) continue;
            if (styleString!='') styleString += `  \n`;
            if (style[0] == '<') {
                style = style.slice(1);
            } else {
                style = ' ' + style;
            }
            styleString += `[${idAttr}]${style}`;
        }
        
        // add style to <style> element
        if (styleString) styleEl.innerHTML += `  \n` + styleString;
        var head  = document.getElementsByTagName('head')[0];
        head.appendChild(styleEl);
    }

    setStylePath(stylePath: string) {
        // checking stylePath for existing
        for(var i = 0; i < document.styleSheets.length; i++){
            if(document.styleSheets[i].href == stylePath){
                return;
            }
        }

        // fix
        if (document.querySelectorAll(`head link[href="${stylePath}"]`).length) return;

        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet'
        link.href = `${stylePath}`;
        var head  = document.getElementsByTagName('head')[0];
        head.appendChild(link);
    }
}
