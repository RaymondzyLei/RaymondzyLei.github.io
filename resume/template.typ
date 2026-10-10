// Academic CV typography inspired by the supplied Computer Modern reference.
#let body-size = 11pt
#let detail-size = 10pt
#let content-inset = 11pt
// One spacing scale for every section; no compact overrides for later sections.
#let section-gap = 16pt
#let entry-gap = 16pt
#let detail-gap = 5pt
#let list-item-gap = 5pt

#let resume(body) = {
  set document(title: "Zhangyue Lei — Curriculum Vitae", author: "Zhangyue Lei")
  set page(
    paper: "us-letter",
    margin: (x: 0.75in, y: 0.5in),
  )
  set text(
    font: ("New Computer Modern", "Libertinus Serif"),
    size: body-size,
    lang: "en",
    fill: black,
    kerning: true,
  )
  set par(justify: true, leading: 0.4em, spacing: 0pt, first-line-indent: 0pt)
  set list(indent: 0pt, body-indent: 9pt, tight: false, spacing: list-item-gap, marker: [•])
  show list: set block(above: detail-gap, below: 0pt)
  show link: underline.with(offset: 1.5pt, stroke: 0.35pt)
  show heading.where(level: 1): it => block(
    above: section-gap,
    below: 6pt,
    sticky: true,
    width: 100%,
    inset: (bottom: 3pt),
    stroke: (bottom: 0.5pt + black),
  )[
    #text(size: 11pt, weight: "regular", it.body)
  ]
  body
}

#let header(name: "", phone: "", email: "") = {
  align(center, block(above: 0pt, below: 0pt)[
    #text(size: 22pt, weight: "regular", name)
    #v(5pt)
    #text(size: body-size)[
      Tel: #phone #h(8pt) · #h(8pt) Email: #link("mailto:" + email)[#email]
    ]
  ])
}

// Semantic headings also create PDF bookmarks without a CV contents page.
#let resume_heading(txt) = heading(level: 1, numbering: none, txt)

#let edu_item(name: "", degree: "", location: "", date: "") = {
  block(above: 0pt, below: 0pt, breakable: false)[
    #pad(left: content-inset)[
      #grid(
        columns: (1fr, auto),
        column-gutter: 12pt,
        [
          #text(weight: "regular", name)
          #v(detail-gap)
          #degree
        ],
        align(right)[
          #text(size: detail-size, style: "italic", date)
          #if location != "" {
            v(detail-gap)
            text(size: detail-size, style: "italic", location)
          }
        ],
      )
    ]
    #v(detail-gap)
  ]
}

#let research_item(number: 1, title: "", subtitle: "", date: "", ..points) = {
  // Keep each topic and its contributions together; do not orphan a date/title.
  block(above: 0pt, below: entry-gap, breakable: false)[
    #pad(left: content-inset)[
      #grid(
        columns: (1fr, auto),
        column-gutter: 12pt,
        text(weight: "regular")[#number. Topic: #title],
        align(right, text(size: detail-size, style: "italic", date)),
      )
      #if subtitle != "" {
        v(detail-gap)
        text(style: "italic", subtitle)
      }
      #v(detail-gap)
      #list(..points.pos())
    ]
  ]
}

#let skill_item(category: "", skills: "") = {
  block(above: detail-gap, below: 0pt)[
    #pad(left: content-inset)[
      #if category != "" [#category: ]
      #skills
    ]
  ]
}
