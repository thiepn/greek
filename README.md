# Koinē Path

Interactive Biblical Greek learning app focused on active recall, morphology, New Testament reading, adaptive review, and AI-ready tutoring.

## Current beta

- five foundation lessons
- parsing drills with persistent accuracy
- guided John 1:1 reader with progressive hints
- review queue generated from mistakes and difficult words
- competency-based progress tracking
- deterministic Socratic tutor designed for a later secure AI backend
- local-first browser persistence
- responsive desktop, tablet, and mobile UI

## Hosting

The project is a static web app intended for GitHub Pages. After the deployment branch is merged and GitHub Pages is enabled with **GitHub Actions** as the source, the expected public URL is:

`https://thiepn.github.io/greek/`

The app deliberately contains no AI API secret. A real model-backed tutor should be connected later through a secure serverless proxy.
