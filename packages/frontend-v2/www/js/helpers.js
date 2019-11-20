// A few helpers for DOM manipulation.

export const show = el => {
  el.style.display = 'block'
}

export const hide = el => {
  el.style.display = 'none'
}

export const empty = el => {
  while (el.firstChild != null) {
    el.firstChild.parentNode.removeChild(el.firstChild)
  }
}

export const createDiv = (className, content = null) => {
  const div = document.createElement('div')
  div.className = className
  if (Array.isArray(content)) {
    for (const elem of content) {
      div.appendChild(elem)
    }
  } else {
    div.textContent = content
  }
  return div
}
