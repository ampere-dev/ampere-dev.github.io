\documentclass{article}
\usepackage[margin=1in]{geometry}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{listings}
\usepackage{inconsolata}

\definecolor{codegreen}{rgb}{0,0.6,0}
\definecolor{codegray}{rgb}{0.5,0.5,0.5}
\definecolor{codepurple}{rgb}{0.58,0,0.82}
\definecolor{backcolour}{rgb}{0.95,0.95,0.92}

\lstdefinestyle{mystyle}{
    backgroundcolor=\color{backcolour},
    commentstyle=\color{codegreen},
    keywordstyle=\color{magenta},
    numberstyle=\tiny\color{codegray},
    stringstyle=\color{codepurple},
    basicstyle=\ttfamily\footnotesize,
    breakatwhitespace=false,
    breaklines=true,
    captionpos=b,
    keepspaces=true,
    numbers=left,
    numbersep=5pt,
    showspaces=false,
    showstringspaces=false,
    showtabs=false,
    tabsize=2
}

\lstset{style=mystyle}

\title{Ampere Development Website README}
\author{}
\date{}

\begin{document}

\maketitle

\section*{Ampere Development Website}

This repository contains the source code for the official website of Ampere Development, hosted at \href{https://ampere.dev}{https://ampere.dev}. The site is a lightweight, static website built with standard HTML, CSS, and JavaScript. It serves as a professional landing page and information hub for Ampere Development's load bank rental, power testing, and commissioning services.

The website is deployed via GitHub Pages for easy maintenance and instant updates.

\section*{Table of Contents}
\begin{itemize}
    \item \hyperref[sec:features]{Features}
    \item \hyperref[sec:installation]{Installation}
    \item \hyperref[sec:usage]{Usage}
    \item \hyperref[sec:contributing]{Contributing}
    \item \hyperref[sec:license]{License}
    \item \hyperref[sec:contact]{Contact}
\end{itemize}

\section{Features}
\label{sec:features}
\begin{itemize}
    \item \textbf{Static and Lightweight}: Pure HTML, CSS, and JavaScript for fast loading and low maintenance.
    \item \textbf{Responsive Design}: Fully adapts to desktop, tablet, and mobile devices.
    \item \textbf{Easy Customization}: Simple structure allows quick updates to content, styling, or functionality.
    \item \textbf{Accessible}: Designed with accessibility best practices (WCAG-compliant where possible).
    \item \textbf{Embedded Media Support}: Supports images, videos, and other media for enhanced content presentation.
\end{itemize}

\section{Installation}
\label{sec:installation}

To run the website locally, follow these steps:

\begin{enumerate}
    \item Clone the repository:
\begin{lstlisting}[language=bash]
git clone https://github.com/ampere-dev/ampere-dev.github.io.git
\end{lstlisting}
    \item Navigate to the project directory:
\begin{lstlisting}[language=bash]
cd ampere-dev.github.io
\end{lstlisting}
    \item Open the website:
    \begin{itemize}
        \item Simply open \texttt{index.html} in your web browser (e.g., double-click the file or drag it into Chrome/Firefox).
        \item Alternatively, serve the files locally using a simple HTTP server:
\begin{lstlisting}[language=bash]
python -m http.server 8000
\end{lstlisting}
        Then visit \texttt{http://localhost:8000} in your browser. (Requires Python 3.x)
    \end{itemize}
\end{enumerate}

No additional dependencies or build tools are required, as the site uses standard web technologies.

\section{Usage}
\label{sec:usage}

\subsection{Editing the Website}
Modify files in the root directory (e.g., \texttt{index.html}, \texttt{styles.css}, or \texttt{script.js}) to update content, styles, or functionality. Use any text editor (e.g., VS Code, Notepad++).

\subsection{Previewing Changes}
Open \texttt{index.html} in a browser or use a local server (as described above) to view updates.

\subsection{Deploying to GitHub Pages}
\begin{enumerate}
    \item Ensure all files (HTML, CSS, JS, images, etc.) are in the root directory or appropriate subfolders.
    \item Commit and push changes to the \texttt{main} branch:
\begin{lstlisting}[language=bash]
git add .
git commit -m "Update website content"
git push origin main
\end{lstlisting}
    \item Enable GitHub Pages in the repository settings (if not already enabled):
    \begin{itemize}
        \item Go to Settings > Pages in your GitHub repository.
        \item Under ``Source,'' select the \texttt{main} branch and the \texttt{/ (root)} folder, then click ``Save.''
    \end{itemize}
    \item Visit the live site at \href{https://ampere.dev}{https://ampere.dev} (may take a few minutes to propagate).
\end{enumerate}

For more details, see the \href{https://docs.github.com/en/pages}{GitHub Pages Documentation}.

\section{Contributing}
\label{sec:contributing}

Contributions are welcome! To contribute:

\begin{enumerate}
    \item Fork the repository.
    \item Create a new branch (\texttt{git checkout -b feature/your-feature-name}).
    \item Make changes and commit (\texttt{git commit -m "Add your feature"}).
    \item Push to the branch (\texttt{git push origin feature/your-feature-name}).
    \item Open a Pull Request with a clear description of your changes.
\end{enumerate}

Please follow standard best practices for web development contributions.

\section{License}
\label{sec:license}

This project is licensed under the MIT License. See the \texttt{LICENSE} file for details.

\section{Contact}
\label{sec:contact}

For questions or feedback about the website:
\begin{itemize}
    \item GitHub Issues: Open an issue on this repository
\end{itemize}

For Ampere Development services (load bank rentals, power testing, commissioning, etc.):
\begin{itemize}
    \item Visit \href{https://ampere.dev/contact}{https://ampere.dev/contact}
    \item Call 888-345-LOAD
    \item Email: info@ampere.dev
\end{itemize}

Thank you for exploring Ampere Development! ⚡

\end{document}