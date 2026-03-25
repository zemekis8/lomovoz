import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal()
  initHeader()
  initMobileMenu()
  initFAB()
  initSmoothScroll()
  initCounters()
})

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )

  elements.forEach((el) => observer.observe(el))
}

function initHeader() {
  const header = document.getElementById('header')
  if (!header) return

  let lastScroll = 0

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY

    if (currentScroll > 50) {
      header.classList.add('header-scrolled')
    } else {
      header.classList.remove('header-scrolled')
    }

    lastScroll = currentScroll
  }, { passive: true })
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle')
  const close = document.getElementById('menu-close')
  const overlay = document.getElementById('mobile-overlay')
  const drawer = document.getElementById('mobile-drawer')
  const links = document.querySelectorAll('#mobile-drawer a[href^="#"]')

  if (!toggle || !overlay || !drawer) return

  function openMenu() {
    overlay.classList.remove('pointer-events-none', 'opacity-0')
    overlay.classList.add('opacity-100')
    drawer.style.transform = 'translateX(0)'
    document.body.style.overflow = 'hidden'
  }

  function closeMenu() {
    overlay.classList.add('opacity-0')
    overlay.classList.remove('opacity-100')
    drawer.style.transform = 'translateX(100%)'
    setTimeout(() => {
      overlay.classList.add('pointer-events-none')
    }, 300)
    document.body.style.overflow = ''
  }

  toggle.addEventListener('click', openMenu)
  close.addEventListener('click', closeMenu)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu()
  })
  links.forEach((link) => link.addEventListener('click', closeMenu))
}

function initFAB() {
  const fab = document.getElementById('fab-trigger')
  const menu = document.getElementById('fab-menu')

  if (!fab || !menu) return

  let isOpen = false

  fab.addEventListener('click', () => {
    isOpen = !isOpen
    if (isOpen) {
      menu.classList.remove('hidden')
      menu.classList.add('visible')
      fab.querySelector('.fab-icon-phone').style.display = 'none'
      fab.querySelector('.fab-icon-close').style.display = 'block'
    } else {
      menu.classList.remove('visible')
      menu.classList.add('hidden')
      fab.querySelector('.fab-icon-phone').style.display = 'block'
      fab.querySelector('.fab-icon-close').style.display = 'none'
    }
  })

  document.addEventListener('click', (e) => {
    if (isOpen && !fab.contains(e.target) && !menu.contains(e.target)) {
      isOpen = false
      menu.classList.remove('visible')
      menu.classList.add('hidden')
      fab.querySelector('.fab-icon-phone').style.display = 'block'
      fab.querySelector('.fab-icon-close').style.display = 'none'
    }
  })
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href')
      if (targetId === '#') return
      const target = document.querySelector(targetId)
      if (!target) return

      e.preventDefault()
      const headerHeight = document.getElementById('header')?.offsetHeight || 0
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight

      window.scrollTo({ top, behavior: 'smooth' })
    })
  })
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true'
          animateCounter(entry.target)
        }
      })
    },
    { threshold: 0.5 }
  )

  counters.forEach((el) => observer.observe(el))
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10)
  const suffix = el.dataset.suffix || ''
  const prefix = el.dataset.prefix || ''
  const duration = 1500
  const start = performance.now()

  function update(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(eased * target)

    el.textContent = prefix + current.toLocaleString('uk-UA') + suffix

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}
