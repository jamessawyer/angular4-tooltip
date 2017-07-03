import {
    Directive, // 可以给DOM 元素添加行为， 必须添加到 NgModule的 declarations 中
    HostListener, // (eventName: string, args?: string[]): any;
    ComponentRef, // 表示组件实例， 由 ComponentFactory 创建
    ViewContainerRef, // 表示视图的容器， 有2种类型的视图， Host View 和 Template View
    Input, // (bindingPropertyName?: string): any; 声明一个输入数据绑定
    ComponentFactoryResolver, // 用于创建 ComponentFactory
    ComponentFactory // 用于创建组件
} from '@angular/core';
import { TooltipContent } from './TooltipContent';

@Directive({
    selector: '[tooltip]'
})
export class Tooltip {
    @Input('tooltip')
    content: string|TooltipContent;

    @Input()
    tooltipDisabled: boolean;

    @Input()
    tooltipAnimation: boolean;

    @Input()
    tooltipPlacement: 'top'|'bottom'|'left'|'right' = 'bottom';

    private tooltip: ComponentRef<TooltipContent>;
    private visible: boolean;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private resolver: ComponentFactoryResolver
    ) {}

    @HostListener('focusin')
    @HostListener('mouseenter')
    show(): void {
        if (this.tooltipDisabled || this.visible) {
            return;
        }
        this.visible = true;
        if (typeof this.content === 'string') {
            const factory = this.resolver.resolveComponentFactory(TooltipContent);
            if (!this.visible) {
                return;
            }

            this.tooltip = this.viewContainerRef.createComponent(factory);
            this.tooltip.instance.hostElement = this.viewContainerRef.element.nativeElement;
            this.tooltip.instance.content = this.content as string;
            this.tooltip.instance.placement = this.tooltipPlacement;
            this.tooltip.instance.animation = this.tooltipAnimation;
        } else {
            const tooltip = this.content as TooltipContent;
            tooltip.hostElement = this.viewContainerRef.element.nativeElement;
            tooltip.placement = this.tooltipPlacement;
            tooltip.animation = this.tooltipAnimation;
            tooltip.show();
        }
    }

    @HostListener('focusout')
    @HostListener('mouseleave')
    hide(): void {
        if (!this.visible) {
            return;
        }
        this.visible = false;
        if (this.tooltip) {
            this.tooltip.destroy();
        }

        if (this.content instanceof TooltipContent) {
            (this.content as TooltipContent).hide();
        }
    }

}