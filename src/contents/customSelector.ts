import type { PlasmoCSConfig } from 'plasmo'

import { FURIGANA_CLASS } from './core'
import { addFurigana } from './furiganaMaker'

export const config: PlasmoCSConfig = {
  matches: ['https://*/*']
}

class Renderer {
  readonly #BORDER = 5
  readonly #PADDING = 2
  readonly #GENERAL_CSS = {
    position: 'fixed',
    display: 'none',
    background: 'DodgerBlue',
    // Max z-index - 1, leaving a larger z-index available for <CustomMenu />.
    zIndex: 2 ** 31 - 2
  }
  readonly #BOTTOM_CSS = {
    color: 'white',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: `${this.#BORDER * 2}px`,
    lineHeight: `${this.#BORDER * 4}px`,
    paddingLeft: `${this.#BORDER}px`,
    paddingRight: `${this.#BORDER}px`
  }
  readonly #left = document.createElement('div')
  readonly #right = document.createElement('div')
  readonly #top = document.createElement('div')
  readonly #bottom = document.createElement('div')
  readonly #getTagPath = (element: HTMLElement) => {
    const parent = element.parentNode as HTMLElement | null
    const parentTagName = parent?.tagName.toLowerCase() ?? ''
    return `${parentTagName} ${element.tagName.toLowerCase()}`
  }
  constructor() {
    document.documentElement.appendChild(this.#left)
    document.documentElement.appendChild(this.#right)
    document.documentElement.appendChild(this.#top)
    document.documentElement.appendChild(this.#bottom)
    Object.assign(this.#left.style, this.#GENERAL_CSS)
    Object.assign(this.#right.style, this.#GENERAL_CSS)
    Object.assign(this.#top.style, this.#GENERAL_CSS)
    Object.assign(this.#bottom.style, this.#GENERAL_CSS, this.#BOTTOM_CSS)
  }

  public readonly hide = () => {
    this.#left.style.display = 'none'
    this.#right.style.display = 'none'
    this.#top.style.display = 'none'
    this.#bottom.style.display = 'none'
  }

  public readonly show = () => {
    this.#left.style.display = 'block'
    this.#right.style.display = 'block'
    this.#top.style.display = 'block'
    this.#bottom.style.display = 'block'
  }
  public readonly add = (element: HTMLElement) => {
    this.hide()

    const { left, top, width, height } = element.getBoundingClientRect()
    const outerLeft = left - this.#BORDER - this.#PADDING
    const outerTop = top - this.#BORDER - this.#PADDING
    const outerWidth = width + this.#BORDER * 2 + this.#PADDING * 2
    const outerHeight = height + this.#BORDER * 4 + this.#PADDING * 2

    // Just a tooltip cobbled together with absolute positioning, don't read.
    this.#left.style.left = `${outerLeft}px`
    this.#left.style.top = `${outerTop}px`
    this.#left.style.width = `${this.#BORDER}px`
    this.#left.style.height = `${outerHeight}px`

    this.#right.style.left = `${outerLeft + outerWidth - this.#BORDER}px`
    this.#right.style.top = `${outerTop}px`
    this.#right.style.width = `${this.#BORDER}px`
    this.#right.style.height = `${outerHeight}px`

    this.#top.style.left = `${outerLeft}px`
    this.#top.style.top = `${outerTop}px`
    this.#top.style.width = `${outerWidth}px`
    this.#top.style.height = `${this.#BORDER}px`

    this.#bottom.style.left = `${outerLeft}px`
    this.#bottom.style.top = `${outerTop + outerHeight - this.#BORDER * 3}px`
    this.#bottom.style.width = `${outerWidth}px`
    this.#bottom.style.height = `${this.#BORDER * 4}px`
    this.#bottom.textContent = this.#getTagPath(element)

    this.show()
  }
}

// Singleton pattern
export class Selector {
  readonly #renderer = new Renderer()
  static readonly #selector = new Selector()
  #isOpen = false
  readonly #onElementSelected = addFurigana
  readonly #pointeroverHandler = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    this.#renderer.hide()
    if (event.target === document.body) {
      return
    }
    this.#renderer.add(event.target! as HTMLElement)
  }

  readonly #pointerupOrClickHandler = (event: Event) => {
    // The jump event of click an internal link in Vue SPA is not a default event and cannot be prevented.
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    // Only need to handle events triggered non-programmatically.
    if (!event.isTrusted) {
      return
    }
    const target = event.target! as HTMLElement
    this.#onElementSelected(target)
  }

  static readonly create = () => {
    return this.#selector
  }

  readonly open = () => {
    if (this.#isOpen) {
      return
    }
    this.#isOpen = true
    this.#renderer.show()
    const elements = document.querySelectorAll(`body *:not(.${FURIGANA_CLASS})`)
    Array.from(elements).forEach((element) => {
      // click event is triggered after pointerup event.
      element.addEventListener('click', this.#pointerupOrClickHandler, {
        capture: true
      })
      element.addEventListener('pointerup', this.#pointerupOrClickHandler, {
        capture: true
      })
      element.addEventListener('pointerover', this.#pointeroverHandler, {
        capture: true
      })
    })
  }

  readonly close = () => {
    if (!this.#isOpen) {
      return
    }
    this.#isOpen = false
    this.#renderer.hide()
    const elements = document.querySelectorAll('body *')
    Array.from(elements).forEach((element) => {
      element.removeEventListener('click', this.#pointerupOrClickHandler, {
        capture: true
      })
      element.removeEventListener('pointerup', this.#pointerupOrClickHandler, {
        capture: true
      })
      element.removeEventListener('pointerover', this.#pointeroverHandler, {
        capture: true
      })
    })
  }
}
