import { BaseRouter, i18nUrl } from 'outlinejs/lib/routers'

import { DetailController } from './controllers'

export default class extends BaseRouter {
  get translatedObject () {
    return {
      'a': true,
      2: false, // is valid and the property.key.rawValue is not a string
      '_gettext:b': 'b',
      '_gettext:c': 'c'
    }
  }

  get urlPatterns () {
    return {
      '_i18n::slug:': i18nUrl('category:detail', DetailController)
    }
  }
}
