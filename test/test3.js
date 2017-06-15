import { BaseRouter, i18nUrl } from 'outlinejs/lib/routers';

import { DetailController } from './controllers';
import { CartController, BuyController, ThankYouPageController } from './controllers';

export default class extends BaseRouter {
  get urlPatterns() {
    return {
      '_i18n:themes/_i18n::slug:': i18nUrl('theme:detail', DetailController),
      '_i18n:themes/_i18n::slug:/:edit-slug:': i18nUrl('theme:edit', DetailController),
      '_i18n:occasions/_i18n::slug:': i18nUrl('occasion:detail', DetailController),
      '_i18n:occasions/:slug:': i18nUrl('occasion:edit', DetailController),
      '_i18n::slug:': i18nUrl('category:detail', DetailController),
      '': i18nUrl('cart:detail', CartController),
      '_i18n:cartconfirm': i18nUrl('cart:confirm', BuyController),
      '_i18n:thankyoupage': i18nUrl('cart:thankyoupage', ThankYouPageController)
    };
  }
}
