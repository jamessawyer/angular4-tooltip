import {
    Component,
    Input,
    AfterViewInit, // lifecycle 一个组件视图完全初始化之后调用
    ChangeDetectorRef,
    ElementRef
} from '@angular/core';
import { Element } from '@angular/compiler';


/**
 * * **animations** - list of animations of this component 组件的动画列表
 * * **changeDetection** - change detection strategy used by this component 组件的变化检测策略
 * * **encapsulation** - style encapsulation strategy used by this component 组件的样式封装策略
 * * **entryComponents** - list of components that are dynamically inserted into the view of this
 *   component 动态插入到这个组件视图的一组组件
 * * **exportAs** - name under which the component instance is exported in a template 在模板中导出组件实例的名称
 * * **host** - map of class property to host element bindings for events, properties and
 *   attributes 类属性的映射，用于绑定事件，属性和特性 相当于 HostBinding 或者 HostListener
 * * **inputs** - list of class property names to data-bind as component inputs
 * * **interpolation** - custom interpolation markers used in this component's template 此组件的模板中使用的自定义插值标记
 * * **moduleId** - ES/CommonJS module id of the file in which this component is defined
 * * **outputs** - list of class property names that expose output events that others can
 *   subscribe to 暴露给外界，以便外界订阅的类属性列表
 * * **providers** - list of providers available to this component and its children 此组件及其子级可用的提供商列表
 * * **queries** -  configure queries that can be injected into the component 可以插入到组件中的查询配置
 * * **selector** - css selector that identifies this component in a template
 * * **styleUrls** - list of urls to stylesheets to be applied to this component's view
 * * **styles** - inline-defined styles to be applied to this component's view
 * * **template** - inline-defined template for the view
 * * **templateUrl** - url to an external file containing a template for the view
 * * **viewProviders** - list of providers available to this component and its view children 此组件及其视图子级可用的提供商列表
 */

@Component({
    selector: 'tooltip-content',
    template: `
        <div class="tooltip {{ placement }}"
            [style.top.px]="top"
            [style.left.px]="left"
            [class.in]="isIn"
            [class.fade]="isFade"
            role="tooltip"
        >
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner">
                <ng-content></ng-content>
                {{ content }}
            </div>
        </div>
    `
})
export class TooltipContent implements AfterViewInit {
    // Inputs / Outputs
    @Input()
    hostElement: HTMLElement;

    @Input()
    content: string; // tooltip的内容

    @Input()
    placement: 'top'|'bottom'|'left'|'right' = 'bottom';

    @Input()
    animation: boolean = false; // 是否开启动画

    // 组件属性
    top: number = -100000;
    left: number = -100000;
    isIn: boolean = false;
    isFade: boolean = false;

    // 构造器
    constructor(
        private element: ElementRef,
        private cdr: ChangeDetectorRef
    ) {}

    // 生命周期
    ngAfterViewInit(): void {
        this.show();
        this.cdr.detectChanges();
    }

    // 公共方法

    // 显示tooltip
    show(): void {
        if (!this.hostElement) {
            return;
        }
        const p = this.positionElements(this.hostElement, this.element.nativeElement.children[0], this.placement);
        this.top = p.top;
        this.left = p.left;
        this.isIn = true;
        if (this.animation) {
            this.isFade = true;
        }
    }

    hide(): void {
        this.top = -100000;
        this.left = -100000;
        this.isIn = false;
        if (this.animation) {
            this.isFade = false;
        }
    }

    // 私有方法
    private positionElements(
        hostEl: HTMLElement,
        targetEl: HTMLElement,
        positionStr: string,
        appendToBody: boolean = false): { top: number, left: number} {
            const positionStrParts = positionStr.split('-');
            let pos0 = positionStrParts[0];
            let pos1 = positionStrParts[1] || 'center';
            let hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);
            let targetElWidth = targetEl.offsetWidth;
            let targetElHeight = targetEl.offsetHeight;
            let shiftWidth: any = {
                center(): number {
                    return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
                },
                left(): number {
                    return hostElPos.left;
                },
                right(): number {
                    return hostElPos.left + hostElPos.width;
                }
            };

            let shiftHeight: any = {
                center(): number {
                    return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
                },
                top(): number {
                    return hostElPos.top;
                },
                bottom(): number {
                    return hostElPos.top + hostElPos.height;
                }
            };

            let targetElPos: { top: number, left: number };
                switch (pos0) {
                    case 'right':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: shiftWidth[pos0]()
                        };
                        break;

                    case 'left':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: hostElPos.left - targetElWidth
                        };
                        break;

                    case 'bottom':
                        targetElPos = {
                            top: shiftHeight[pos0](),
                            left: shiftWidth[pos1]()
                        };
                        break;

                    default:
                        targetElPos = {
                            top: hostElPos.top - targetElHeight,
                            left: shiftWidth[pos1]()
                        };
                        break;
                }

            return targetElPos;
    }

    private position(nativeEl: HTMLElement): { width: number, height: number, top: number, left: number } {
        let offsetParentBCR = { top: 0, left: 0 };
        const elBCR = this.offset(nativeEl);
        const offsetParentEl = this.parentOffsetEl(nativeEl);
        if (offsetParentEl !== this.parentOffsetEl(nativeEl)) {
            offsetParentBCR = this.offset(offsetParentEl);
            offsetParentBCR.top = offsetParentEl.clientTop - offsetParentEl.scrollTop;
            offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: elBCR.top - offsetParentBCR.top,
            left: elBCR.left - offsetParentBCR.left
        }
    }

    // 计算原生元素的维度信息
    private offset(nativeEl: any): { width: number, height: number, top: number, left: number } {
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: boundingClientRect.top + (window.pageYOffset || window.document.documentElement.scrollTop), // 后面时加上滚动条的高度
            left: boundingClientRect.left + (window.pageXOffset || window.document.documentElement.scrollLeft)
        };
    }

    private getStyle(nativeEl: HTMLElement, cssProp: string): string {
        if ((nativeEl as any).currentStyle) { // IE
            return (nativeEl as any).currentStyle[cssProp];
        }

        if (window.getComputedStyle) {
            return (window.getComputedStyle(nativeEl) as any)[cssProp];
        }

        return (nativeEl.style as any)[cssProp];
    }

    private isStaticPositioned(nativeEl: HTMLElement): boolean {
        return (this.getStyle(nativeEl, 'position') || 'static' ) === 'static';
    }

    private parentOffsetEl(nativeEl: HTMLElement): any {
        let offsetParent: any = nativeEl.offsetParent || window.document;
        while (offsetParent && offsetParent !== window.document && this.isStaticPositioned(offsetParent)) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || window.document;
    }

}