import { TooltipPage } from './app.po';

describe('tooltip App', () => {
  let page: TooltipPage;

  beforeEach(() => {
    page = new TooltipPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
