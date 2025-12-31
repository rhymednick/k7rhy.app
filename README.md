# K7RHY Ham Radio Electronics Kits

Welcome to the repository for K7RHY Ham Radio Electronics Kits! This site demonstrates my skills in software development, technical writing, and product development. It is intended to be a perpetual work-in-progress, or as they say, "never finished, always complete."

## Overview

K7RHY Ham Radio Electronics Kits offers a variety of kits for ham radio enthusiasts. The website is designed to be user-friendly and informative, provide detailed product documentation, interactive tools, and educational content. Amateur radio is about personal and intellectual growth through experimentation, and the field is so broad that there's always a new area to explore. With the documentation and kits I'm providing here, my goal is to feed and nurture that quest for knowledge in you. However, here in the GitHub realm, we're looking at the website source code, so I'll be focusing on how I've built something that makes it easier to document my products in a way that's stimulating to the people I'm reaching.

## Purpose

This website not only supports my ham radio electronics kit business but also serves as a demonstration of my capabilities in:

- Developing dynamic controls to streamline the creation of responsive, interactive, web-based documentation.
- Writing clear and concise technical documentation.
- Implementing modern CI/CD pipelines for efficient development workflows.

## Key Site Technologies

- **Next.js**: Enables server-side rendering and static site generation.
- **TypeScript**: Ensures robust and maintainable code.
- **Shadcn UI Components**: Delivers a polished and customizable user interface.
- **Netlify**: Facilitates continuous integration and deployment to a production server (https://k7rhy.app).

## Features

When it comes to writing documentation, I don't like mindless work and I'm continually trying to improve things. Those two things are at odds with each other sometimes. Imagine that deicde to restructure some content by moving a block of text to a new location within a document or into an entirely new document. While it might be an improvement to the content, I'm going to need to verify that all the existing heading styles/levels are appropriate in their new context. That's not difficult, and it doesn't take long, but it's an opportunity for me to miss something and degrade the quality of the content. Therefore, editing existing content comes with some risks. The same is true for software development, but in software there is a rich ecosystem of tools that will tell you if you broke something. Why can't documentation be built like software so that it can take advantage of that developer ecosystem? It can! However, very few organizations invest adequate resources into documentation, and nearly all of them rely on antique infrastructure. This site is an opportunity for me to build my dream platform and delegate all of the mindless tasks to the computer.

As I said before, I intend for this site to be a perpetual work in progress. Here's how this works: (1) I start to write a doc. (2) Some bit of mindless repetetion develops in the authoring process giving me an idea for a feature to add, or a new idea pops into my head. (3) I build the improvement.

Here's what we have in the site so far:

- Architecture:
    - Pages are organized by folders and folders contain components that add a layer to the page. Everything in the same folder has the same outer layer of components. By inheriting the outer layers, I can focus on the content and ignore the infrastructure as I'm writing a doc.
    - Pages are heirarchical objects composed of reusable or original components. Some components are imported from public libraries (ex. Next.js and Shadcn UI components) and some are ones I built.
    - Visual styles are simplified by the use of the theme-enabled framework TailwindCSS. This is how I was able to add a day/night mode toggle to the site with very little effort.
- My Components - The new/original components that I built:
    - PageNavigation - This component reads the rendered page, identifies the topic headings, and displays them in a floating page navigation area on the right side of the page. You can navigate to the topic by clicking the item in the navigation. This isn't a new idea, but users like having a map of the content on a page so I built it. As a doc writer, I don't need to do anything to enable it or configure it, it just works.
    - DocSection - This component holds a chunk of content and a heading for it. Sections can be nested and it formats itself based on its nesting context. For example, a top-level section would display the title as an H1 and its first child would be an H2. What's important is that the doc writer doesn't need to worry about formatting, just structure and content.
    - DocImage - This is an image container that allows you to click on an image to display a larger version of the image. As the doc writer, you add the image like you normally would, but you get the additional functionality for no extra work.
    - DocProcedure - This is a component that takes a data structure and renders it as a well-formatted, ordered, procedure. The writer doesn't need to worry about formatting or numbering of steps. Writing procedure docs is incrediby labor intensive. This automates a good chunk of that work. Are you seeing a pattern?
    - PowerCalculator - This is an embedded tool that allows you to do a math conversion (voltage to power). It's implemented as a fly-out from the side of the screen so it's easy to pop it up wherever you might need it, as in, when you're reading my doc about how to measure the power being transmitted by your radio. There will be many calculators like this. I've already come up with a few kits ideas that would benefit from them.
    - DocBreadcrumb - This is a component that formats your page breadcrumbs for you. It's manual at the moment, but I will be updating it soon to provide the breadcrumbs automatically (like the PageNavigation).
    - DocIndexCard - This shows a summary of a collection of documents to make the site easier to navigate.

---

## Contributing

Interested in contributing? Please read the [Contributing Guide](CONTRIBUTING.md) for details on how to set up your development environment.

---

For any questions or support, please reach out via the repository's issue tracker or contact me directly.

- Rhy Mednick (73, K7RHY)
