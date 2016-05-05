/**
 * Created by Targus on 05.05.2016.
 * @author Bogdan Shapoval (targus) <it.targus@gmail.com>
 */

import {Directive, Input, ElementRef, ViewContainerRef} from 'angular2/core';

export interface IStyledConfig {
    [propName: string]: {
        path?: string;
        block?: string;
    }
}

export interface ISkinable {
    getStyledConfig(): IStyledConfig;
}

@Directive({
    selector: '[styled]'
})
export class Ng2StyledDirective {

    @Input() stylePath: string = null;
    @Input() styleBlock: string = null;
    @Input() skin:string;

    private _config: IStyledConfig = {};

    constructor(private el:ElementRef, private _view: ViewContainerRef) {}

    ngAfterViewInit() {

        // get component instance in case directive was applied to component
        var component = (<any>this._view)._element.component;

        if (typeof(component) == 'object' && typeof(component.getStyledConfig) == 'function') {
            this._config = <IStyledConfig>component.getStyledConfig();
        }

        if (this.stylePath != null) {
            this.setStylePath(this.stylePath);
        } else if (this.skin != null && typeof(this.skin) != 'undefined' && typeof(this._config[this.skin].path) != 'undefined') {
            this.setStylePath(this._config[this.skin].path);
        }
        if (this.styleBlock != null) {
            this.setStyleBlock(this.styleBlock);
        } else if (this.skin != null && typeof(this.skin) != 'undefined' && typeof(this._config[this.skin].block) != 'undefined') {
            this.setStyleBlock(this._config[this.skin].block);
        }

    }

    setStyleBlock(style: any) {
        if (typeof(style) == 'string') {
            this.setStyleForElement(style);
        }
    }

    getIdentityAttribute() {
        for (let attr of this.el.nativeElement.attributes) {
            if (/^_nghost/.test(attr.name) || /^_ngcontent/.test(attr.name)) {
                return attr.name;
            }
        }
        return false;
    }

    setStyleForElement(style: string) {
        // get styling encapsulation attribute
        var idAttr = this.getIdentityAttribute();
        // create own encapsulation attribute, if not exist
        if (!idAttr) {
            idAttr = '_styled-'+Math.random().toString(36).slice(2, 6);
            this.el.nativeElement.setAttribute(idAttr,'');
        }
        var styleEl = document.createElement('style');
        styleEl.type = 'text/css';
        var styleString = `[${idAttr}] ${style}`;
        styleEl.innerHTML = styleString;
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
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet'
        link.href = `${stylePath}`;
        var head  = document.getElementsByTagName('head')[0];
        head.appendChild(link);
    }
}
