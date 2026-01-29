# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

日本語で回答すること。

## Project Overview

A standalone HTML5 timekeeper application for Zoom breakout room sessions. Designed for structured group discussions with 3 participants taking turns through predefined time-boxed activities.

## Running the Application

Open `timekeeper.html` directly in a web browser - no build process or server required.

```bash
# Windows
start timekeeper.html

# macOS
open timekeeper.html
```

## Architecture

Single-file application (`timekeeper.html`) containing:
- **Inline CSS**: Dark theme styling with color-coded progress states (green → yellow → red)
- **Vanilla JavaScript**: Event-driven timer with Web Audio API for sound alerts

Key state variables:
- `schedule[]` - Array of session objects with name, duration, and person assignment
- `currentIndex` - Active session in the schedule
- `timeRemaining` - Countdown seconds for current session
- `timerInterval` - setInterval reference for the 1-second tick

Session structure: 1 setup phase (2 min) + 3 rounds of 4 activities per person (3+5+10+3 min each).
