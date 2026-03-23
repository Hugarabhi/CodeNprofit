async function uploadModule() {
  initializeFirebase();

  const moduleData = {
    id: "html-css",
    title: "HTML & CSS Fundamentals",
    badge: "Web Foundations Badge",
    skill: "Full Stack Developer",

    chapters: [ 
        {
          id: 'ch1',
          title: 'Introduction to HTML',
          duration: '20 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">What is HTML?</h2>
                  <p class="content-text">HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using markup. HTML elements are the building blocks of HTML pages, represented by tags.</p>
                  
                  <div class="info-box">
                    <div class="info-icon"><i class="fas fa-lightbulb"></i></div>
                    <div class="info-content">
                      <h4>Did You Know?</h4>
                      <p>HTML was created by Tim Berners-Lee in 1991 while working at CERN. The first version had only 18 tags! Today, HTML5 has over 100 tags and is maintained by the World Wide Web Consortium (W3C).</p>
                    </div>
                  </div>
                  
                  <h3 class="section-subtitle">How HTML Works</h3>
                  <p class="content-text">When you visit a website, your browser (like Chrome, Firefox, or Safari) requests HTML files from a server. The browser then reads the HTML and renders it as a visual webpage. Think of HTML as the skeleton that gives structure to your content.</p>
                `
              },
              {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                caption: 'The basic structure of an HTML document'
              },
              {
                type: 'text',
                content: `
                  <h3 class="section-subtitle">Basic HTML Document Structure</h3>
                  <p class="content-text">Every HTML document follows a specific structure. Let's look at the minimal required elements:</p>
                `
              },
              {
                type: 'code',
                language: 'html',
                code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My First Web Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>This is my first paragraph.</p>\n</body>\n</html>'
              },
              {
                type: 'list',
                title: 'HTML Elements Explained:',
                items: [
                  '<strong>&lt;!DOCTYPE html&gt;</strong> - Declares the document type as HTML5. This must be the very first line.',
                  '<strong>&lt;html&gt;</strong> - The root element that wraps all content on the entire page.',
                  '<strong>&lt;head&gt;</strong> - Contains meta information about the page (not displayed to users).',
                  '<strong>&lt;meta charset="UTF-8"&gt;</strong> - Specifies the character encoding (supports all languages).',
                  '<strong>&lt;title&gt;</strong> - Sets the page title shown in the browser tab and search results.',
                  '<strong>&lt;body&gt;</strong> - Contains all visible content (headings, paragraphs, images, etc.).',
                  '<strong>&lt;h1&gt;</strong> - A top-level heading (there are h1 through h6).',
                  '<strong>&lt;p&gt;</strong> - A paragraph of text.'
                ]
              },
              {
                type: 'tip',
                content: 'Always include the `lang="en"` attribute in your `<html>` tag. This helps search engines and screen readers understand the language of your content, improving accessibility and SEO.'
              }
            ],
            quiz: [
              {
                question: 'What does HTML stand for?',
                options: [
                  'Hyper Text Markup Language',
                  'High Tech Modern Language',
                  'Hyper Transfer Markup Language',
                  'Home Tool Markup Language'
                ],
                correct: 0,
                explanation: 'HTML stands for HyperText Markup Language. "HyperText" refers to the links that connect web pages, and "Markup" refers to the tags used to structure content.'
              },
              {
                question: 'Which tag is used to define the main content area of an HTML document?',
                options: ['<head>',
                     '<body>', '<main>', '<content>'],
                correct: 1,
                explanation: 'The <body> tag contains all the visible content of an HTML document, including text, images, links, etc. The <head> contains metadata, and <main> is for the primary content (HTML5).'
              },
              {
                question: 'Where does the <title> tag go in an HTML document?',
                options: ['Inside the <body>', 'Inside the <head>', 'After the <html> tag', 'Before the <!DOCTYPE>'],
                correct: 1,
                explanation: 'The <title> tag is placed inside the <head> section. It defines the title that appears in the browser tab and is used by search engines as the clickable headline in search results.'
              },
              {
                question: 'Which tag is used for the largest heading?',
                options: ['<h1>', '<heading>', '<h6>', '<head>'],
                correct: 0,
                explanation: '<h1> defines the most important heading, while <h6> defines the least important heading. Search engines use heading structure to understand page content hierarchy.'
              },
              {
                question: 'What is the purpose of the <!DOCTYPE html> declaration?',
                options: [
                  'To link to a CSS file',
                  'To tell the browser which version of HTML to use',
                  'To create a new document',
                  'To add comments to the code'
                ],
                correct: 1,
                explanation: 'The <!DOCTYPE html> declaration tells the browser that the document uses HTML5. Without it, browsers might render the page in "quirks mode" which can cause layout and styling inconsistencies.'
              }
            ]
          }
        },
        {
          id: 'ch2',
          title: 'HTML Elements & Attributes',
          duration: '25 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">HTML Elements and Attributes</h2>
                  <p class="content-text">HTML elements can have attributes that provide additional information about the element. Attributes are always specified in the opening tag and usually come in name/value pairs like name="value".</p>
                `
              },
              {
                type: 'code',
                language: 'html',
                code: '<!-- Element with attributes -->\n<a href="https://example.com" target="_blank">Click me</a>\n<img src="image.jpg" alt="Description" width="300" height="200">\n<input type="text" placeholder="Enter your name" required>'
              },
              {
                type: 'table',
                title: 'Common HTML Attributes',
                headers: ['Attribute', 'Used With', 'Description'],
                rows: [
                  ['href', '&lt;a&gt;, &lt;link&gt;', 'Specifies the URL of a link'],
                  ['src', '&lt;img&gt;, &lt;script&gt;, &lt;iframe&gt;', 'Specifies the source file URL'],
                  ['alt', '&lt;img&gt;', 'Provides alternative text for images'],
                  ['class', 'All elements', 'Assigns one or more class names for CSS'],
                  ['id', 'All elements', 'Assigns a unique identifier'],
                  ['style', 'All elements', 'Adds inline CSS styles'],
                  ['title', 'All elements', 'Provides additional information (tooltip)'],
                  ['target', '&lt;a&gt;, &lt;form&gt;', 'Specifies where to open the link'],
                  ['type', '&lt;input&gt;, &lt;button&gt;', 'Specifies the type of input']
                ]
              },
              {
                type: 'text',
                content: `
                  <h3 class="section-subtitle">Block vs Inline Elements</h3>
                  <p class="content-text">HTML elements are generally divided into two categories: block-level and inline elements.</p>
                `
              },
              {
                type: 'list',
                title: 'Block Elements:',
                items: [
                  'Start on a new line and take up the full width available',
                  'Have a line break before and after them',
                  'Examples: <div>, <h1>-<h6>, <p>, <ul>, <ol>, <li>, <section>, <header>, <footer>'
                ]
              },
              {
                type: 'list',
                title: 'Inline Elements:',
                items: [
                  'Do not start on a new line and only take up as much width as necessary',
                  'Flow within the text',
                  'Examples: <span>, <a>, <strong>, <em>, <img>, <br>'
                ]
              },
              {
                type: 'code',
                language: 'html',
                code: '<!-- Block elements create structure -->\n<div style="border: 1px solid red;">\n    <h2>This is a heading (block)</h2>\n    <p>This is a paragraph <span style="color: blue;">with an inline span</span> inside.</p>\n    <a href="#">This link is inline</a> - it stays in the same line.\n</div>'
              },
              {
                type: 'tip',
                content: 'Understanding block vs inline is crucial for CSS layout. You can change an element\'s display type with the CSS `display` property (e.g., `display: inline-block;`).'
              }
            ],
            quiz: [
              {
                question: 'Where are HTML attributes placed?',
                options: [
                  'In the closing tag',
                  'In the opening tag',
                  'Anywhere in the element',
                  'In a separate file'
                ],
                correct: 1,
                explanation: 'HTML attributes are always placed in the opening tag of an element, after the element name.'
              },
              {
                question: 'Which attribute provides alternative text for images?',
                options: ['src', 'href', 'alt', 'title'],
                correct: 2,
                explanation: 'The `alt` attribute provides alternative text for images. It is crucial for accessibility and is displayed if the image fails to load.'
              },
              {
                question: 'What is the difference between block and inline elements?',
                options: [
                  'Block elements are larger than inline elements',
                  'Block elements start on a new line and take full width, inline elements flow with text',
                  'Block elements can only contain text, inline elements can contain other elements',
                  'There is no difference'
                ],
                correct: 1,
                explanation: 'Block elements create a new block and take the full width available, while inline elements only take as much width as needed and flow within the text.'
              },
              {
                question: 'Which of these is a semantic HTML5 element?',
                options: ['<div>', '<span>', '<article>', '<b>'],
                correct: 2,
                explanation: '<article> is a semantic HTML5 element that represents a self-contained composition. <div> and <span> are non-semantic, and <b> is presentational (use <strong> for importance).'
              },
              {
                question: 'What is the purpose of the `id` attribute?',
                options: [
                  'To apply CSS styles to multiple elements',
                  'To provide a unique identifier for an element',
                  'To link to external resources',
                  'To specify the language of the content'
                ],
                correct: 1,
                explanation: 'The `id` attribute provides a unique identifier for an element. Each id must be unique within a document and can be used for linking, CSS targeting, and JavaScript manipulation.'
              }
            ]
          }
        },
        {
          id: 'ch3',
          title: 'HTML Forms & Input',
          duration: '30 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">HTML Forms</h2>
                  <p class="content-text">Forms are how users interact with websites - they're used for login, registration, search, feedback, and more. The <form> element wraps all form controls.</p>
                `
              },
              {
                type: 'code',
                language: 'html',
                code: '<form action="/submit-form" method="POST">\n    <label for="name">Name:</label>\n    <input type="text" id="name" name="name" required>\n    \n    <label for="email">Email:</label>\n    <input type="email" id="email" name="email" required>\n    \n    <label for="message">Message:</label>\n    <textarea id="message" name="message" rows="4"></textarea>\n    \n    <button type="submit">Send Message</button>\n</form>'
              },
              {
                type: 'table',
                title: 'Form Attributes',
                headers: ['Attribute', 'Description'],
                rows: [
                  ['action', 'URL where form data is sent'],
                  ['method', 'HTTP method (GET or POST)'],
                  ['enctype', 'How data should be encoded (for file uploads)'],
                  ['target', 'Where to display the response'],
                  ['autocomplete', 'Enable/disable autocomplete']
                ]
              },
              {
                type: 'text',
                content: `
                  <h3 class="section-subtitle">Input Types</h3>
                  <p class="content-text">HTML5 introduced many new input types for better user experience and validation:</p>
                `
              },
              {
                type: 'code',
                language: 'html',
                code: '<!-- Text Inputs -->\n<input type="text" placeholder="Regular text">\n<input type="email" placeholder="Email address">\n<input type="password" placeholder="Password">\n<input type="search" placeholder="Search...">\n<input type="tel" placeholder="Phone number">\n<input type="url" placeholder="Website URL">\n\n<!-- Numerical Inputs -->\n<input type="number" min="0" max="100" step="1">\n<input type="range" min="0" max="100">\n\n<!-- Date/Time Inputs -->\n<input type="date">\n<input type="time">\n<input type="datetime-local">\n<input type="month">\n<input type="week">\n\n<!-- Other Inputs -->\n<input type="color">\n<input type="file">\n<input type="checkbox">\n<input type="radio">\n<input type="hidden">'
              },
              {
                type: 'info',
                content: 'Using the correct input type (like email, number, date) provides built-in validation and shows the appropriate keyboard on mobile devices!'
              }
            ],
            quiz: [
              {
                question: 'Which attribute specifies where to send form data?',
                options: ['method', 'action', 'target', 'enctype'],
                correct: 1,
                explanation: 'The `action` attribute specifies the URL where the form data should be sent for processing.'
              },
              {
                question: 'Which input type is best for email addresses?',
                options: ['text', 'email', 'url', 'string'],
                correct: 1,
                explanation: 'The `email` input type provides built-in validation for email format and shows the appropriate keyboard on mobile devices.'
              },
              {
                question: 'What does the `required` attribute do?',
                options: [
                  'Makes the field mandatory',
                  'Adds a red border',
                  'Prevents form submission',
                  'Shows a popup message'
                ],
                correct: 0,
                explanation: 'The `required` attribute makes a field mandatory - the form cannot be submitted if this field is empty.'
              },
              {
                question: 'Which method should be used for sensitive data like passwords?',
                options: ['GET', 'POST', 'SEND', 'PUT'],
                correct: 1,
                explanation: 'POST should be used for sensitive data because it sends data in the request body, not in the URL like GET does.'
              },
              {
                question: 'What is the purpose of the `<fieldset>` element?',
                options: [
                  'To create a border around form fields',
                  'To group related form elements',
                  'To make fields required',
                  'To add a legend to the form'
                ],
                correct: 1,
                explanation: '<fieldset> is used to group related form elements together, and <legend> provides a caption for the group.'
              }
            ]
          }
        },
        {
          id: 'ch4',
          title: 'Introduction to CSS',
          duration: '25 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">What is CSS?</h2>
                  <p class="content-text">CSS (Cascading Style Sheets) is the language used to style HTML documents. It controls colors, fonts, spacing, layout, and overall visual appearance. CSS saves time by controlling multiple pages at once.</p>
                `
              },
              {
                type: 'info',
                content: 'CSS was first proposed by Håkon Wium Lie in 1994 while working at CERN. The first CSS level 1 specification became official in 1996.'
              },
              {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                caption: 'CSS brings life to plain HTML structures'
              },
              {
                type: 'text',
                content: `
                  <h3 class="section-subtitle">CSS Syntax</h3>
                  <p class="content-text">CSS uses a simple syntax: selectors target HTML elements, and declarations define styles:</p>
                `
              },
              {
                type: 'code',
                language: 'css',
                code: 'selector {\n    property: value;\n    property: value;\n}\n\n/* Example */\nh1 {\n    color: blue;\n    font-size: 24px;\n    text-align: center;\n    font-family: Arial, sans-serif;\n}'
              }
            ],
            quiz: [
              {
                question: 'What does CSS stand for?',
                options: [
                  'Cascading Style Sheets',
                  'Creative Style System',
                  'Computer Style Sheets',
                  'Colorful Style Sheets'
                ],
                correct: 0,
                explanation: 'CSS stands for Cascading Style Sheets. "Cascading" refers to how styles are applied in order of priority (inline > internal > external, with specificity rules).'
              },
              {
                question: 'Which is the correct CSS syntax?',
                options: [
                  'body:color=black;',
                  '{body;color:black;}',
                  'body {color: black;}',
                  'body {color=black;}'
                ],
                correct: 2,
                explanation: 'The correct syntax is selector { property: value; }'
              },
              {
                question: 'Where is the best place to put CSS for a multi-page website?',
                options: [
                  'Inline styles',
                  'Internal style sheet',
                  'External style sheet',
                  'Anywhere is fine'
                ],
                correct: 2,
                explanation: 'External style sheets are best for multi-page sites because one file can style all pages, making maintenance easier and enabling browser caching.'
              },
              {
                question: 'Which HTML tag is used to define an internal CSS?',
                options: ['<css>', '<style>', '<script>', '<link>'],
                correct: 1,
                explanation: 'The <style> tag is used to define internal CSS within an HTML document, typically placed in the <head> section.'
              },
              {
                question: 'What is the correct format for an RGB color?',
                options: ['#FF0000', 'rgb(255, 0, 0)', 'red', 'color(red)'],
                correct: 1,
                explanation: 'rgb(255, 0, 0) is the correct RGB syntax. #FF0000 is HEX, and "red" is a color name - all are valid, but the question asks for RGB format.'
              }
            ]
          }
        },
        {
          id: 'ch5',
          title: 'CSS Selectors & Specificity',
          duration: '35 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">CSS Selectors</h2>
                  <p class="content-text">Selectors determine which elements get styled. Mastering selectors is key to writing efficient, maintainable CSS.</p>
                `
              },
              {
                type: 'code',
                language: 'css',
                code: '/* 1. Element Selector */\np {\n    color: blue;\n}\n\n/* 2. Class Selector (reusable) */\n.highlight {\n    background-color: yellow;\n    font-weight: bold;\n}\n\n/* 3. ID Selector (unique) */\n#header {\n    font-size: 24px;\n    background-color: #f0f0f0;\n}\n\n/* 4. Universal Selector */\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\n/* 5. Descendant Selector */\ndiv p {\n    margin: 10px;\n    color: #333;\n}\n\n/* 6. Child Selector (direct children only) */\ndiv > p {\n    font-style: italic;\n}'
              }
            ],
            quiz: [
              {
                question: 'Which selector has the highest specificity?',
                options: [
                  'Element selector (p)',
                  'Class selector (.class)',
                  'ID selector (#id)',
                  'Universal selector (*)'
                ],
                correct: 2,
                explanation: 'ID selectors have the highest specificity (100 points), followed by classes (10 points), then elements (1 point).'
              },
              {
                question: 'What does the `:hover` pseudo-class do?',
                options: [
                  'Styles visited links',
                  'Styles elements when mouse is over them',
                  'Styles the first line of text',
                  'Styles active elements'
                ],
                correct: 1,
                explanation: ':hover applies styles when the user mouses over an element. It\'s commonly used for buttons and links.'
              },
              {
                question: 'Which selector would select all <p> elements inside a <div>?',
                options: ['div > p', 'div p', 'p div', 'div + p'],
                correct: 1,
                explanation: 'The descendant selector (div p) selects all <p> elements anywhere inside a <div>. The child selector (div > p) selects only direct children.'
              },
              {
                question: 'What is the specificity of the selector `#header .nav a`?',
                options: ['111', '101', '110', '121'],
                correct: 0,
                explanation: '#header = 100, .nav = 10, a = 1. Total = 111'
              },
              {
                question: 'Which pseudo-element is used to insert content before an element?',
                options: [':before', '::before', ':after', '::first-line'],
                correct: 1,
                explanation: '::before (with double colon) is a pseudo-element used to insert content before an element using the content property.'
              }
            ]
          }
        },
        {
          id: 'ch6',
          title: 'CSS Box Model',
          duration: '30 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">The CSS Box Model</h2>
                  <p class="content-text">Every element in web design is a rectangular box. Understanding the box model is crucial for creating layouts. The box model consists of content, padding, border, and margin.</p>
                `
              },
              {
                type: 'code',
                language: 'css',
                code: '/* Box Model Example */\n.box {\n    /* Content - where text/images appear */\n    width: 300px;\n    height: 200px;\n    \n    /* Padding - space inside border */\n    padding: 20px;           /* All sides */\n    padding: 10px 20px;      /* top/bottom left/right */\n    padding: 10px 15px 20px 25px; /* top right bottom left */\n    \n    /* Border - edge around padding */\n    border: 2px solid black;\n    border-width: 2px;\n    border-style: solid;\n    border-color: black;\n    \n    /* Margin - space outside border */\n    margin: 15px;            /* All sides */\n    margin: 20px auto;       /* 20px top/bottom, center horizontally */\n}'
              }
            ],
            quiz: [
              {
                question: 'What does the CSS Box Model include?',
                options: [
                  'Content only',
                  'Content and padding only',
                  'Content, padding, border, and margin',
                  'Width and height only'
                ],
                correct: 2,
                explanation: 'The box model consists of content, padding, border, and margin - from the inside out.'
              },
              {
                question: 'What\'s the difference between padding and margin?',
                options: [
                  'They are the same thing',
                  'Padding is inside border, margin is outside',
                  'Padding is for text, margin for images',
                  'Margin is inside border, padding is outside'
                ],
                correct: 1,
                explanation: 'Padding is inside the border (between content and border), margin is outside the border (between elements).'
              },
              {
                question: 'What does `box-sizing: border-box;` do?',
                options: [
                  'Adds a border to the box',
                  'Makes width and height include padding and border',
                  'Changes the box color',
                  'Removes the margin'
                ],
                correct: 1,
                explanation: '`box-sizing: border-box;` makes width and height include padding and border, making layout calculations much easier and more intuitive.'
              },
              {
                question: 'If an element has width: 200px, padding: 20px, border: 2px, and box-sizing: content-box, what is the total width?',
                options: ['200px', '220px', '224px', '244px'],
                correct: 3,
                explanation: 'With content-box, padding and border are added to width: 200 + 20*2 (padding left+right) + 2*2 (border left+right) = 244px.'
              },
              {
                question: 'What happens to vertical margins?',
                options: [
                  'They add together',
                  'They collapse to the larger value',
                  'They multiply',
                  'They remain separate'
                ],
                correct: 1,
                explanation: 'Vertical margins collapse (combine) to the larger of the two margins, while horizontal margins add together.'
              }
            ]
          }
        },
        {
          id: 'ch7',
          title: 'CSS Layout: Flexbox',
          duration: '40 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">Flexbox Layout</h2>
                  <p class="content-text">Flexbox is a one-dimensional layout model that makes it easy to align and distribute space among items in a container. It's perfect for navigation bars, card layouts, and responsive designs.</p>
                `
              },
              {
                type: 'code',
                language: 'css',
                code: '/* Flexbox Basics */\n.container {\n    display: flex;           /* Creates flex container */\n    flex-direction: row;     /* Default: left to right */\n    justify-content: center; /* Main axis alignment */\n    align-items: center;     /* Cross axis alignment */\n    gap: 20px;               /* Space between items */\n}\n\n.item {\n    flex: 1;                 /* Grow to fill available space */\n}'
              }
            ],
            quiz: [
              {
                question: 'What does `display: flex;` do?',
                options: [
                  'Hides the element',
                  'Creates a flex container',
                  'Makes text flexible',
                  'Adds flexibility to layout'
                ],
                correct: 1,
                explanation: 'display: flex; creates a flex container, enabling flexbox layout for its direct children.'
              },
              {
                question: 'Which property controls alignment on the main axis?',
                options: ['align-items', 'justify-content', 'align-content', 'flex-direction'],
                correct: 1,
                explanation: 'justify-content controls alignment on the main axis, while align-items controls alignment on the cross axis.'
              },
              {
                question: 'What is the default value of `flex-direction`?',
                options: ['column', 'row', 'row-reverse', 'column-reverse'],
                correct: 1,
                explanation: 'The default flex-direction is "row", placing items horizontally from left to right.'
              },
              {
                question: 'Which property would you use to make items wrap to the next line?',
                options: ['flex-grow', 'flex-wrap', 'flex-shrink', 'flex-basis'],
                correct: 1,
                explanation: 'flex-wrap: wrap; allows items to wrap onto multiple lines when there isn\'t enough space.'
              },
              {
                question: 'What does `flex: 1;` mean?',
                options: [
                  'Item width is 1px',
                  'Item grows and shrinks equally',
                  'Item has order 1',
                  'Item is hidden'
                ],
                correct: 1,
                explanation: 'flex: 1 is shorthand for flex-grow: 1, flex-shrink: 1, flex-basis: 0, meaning the item can grow and shrink equally with other items.'
              }
            ]
          }
        },
        {
          id: 'ch8',
          title: 'CSS Layout: Grid',
          duration: '40 min',
          content: {
            sections: [
              {
                type: 'text',
                content: `
                  <h2 class="section-title">CSS Grid Layout</h2>
                  <p class="content-text">CSS Grid is a two-dimensional layout system that lets you create complex layouts with rows and columns simultaneously. It's perfect for page layouts, image galleries, and dashboard designs.</p>
                `
              },
              {
                type: 'code',
                language: 'css',
                code: '/* Grid Basics */\n.container {\n    display: grid;                    /* Creates grid container */\n    grid-template-columns: 200px 1fr 200px;  /* 3 columns */\n    grid-template-rows: auto 1fr auto;        /* 3 rows */\n    gap: 20px;                         /* Gutter between cells */\n}'
              }
            ],
            quiz: [
              {
                question: 'What is the main difference between Flexbox and Grid?',
                options: [
                  'Flexbox is newer than Grid',
                  'Flexbox is for 1D layouts, Grid for 2D layouts',
                  'Grid is only for desktop layouts',
                  'They are the same thing'
                ],
                correct: 1,
                explanation: 'Flexbox is one-dimensional (rows OR columns), while Grid is two-dimensional (rows AND columns simultaneously).'
              },
              {
                question: 'What does `grid-template-columns: repeat(3, 1fr);` do?',
                options: [
                  'Creates 3 fixed-width columns',
                  'Creates 3 equal-width flexible columns',
                  'Repeats the layout 3 times',
                  'Creates 3 rows'
                ],
                correct: 1,
                explanation: 'It creates 3 columns that each take 1 fraction (1fr) of the available space, making them equal width.'
              },
              {
                question: 'How do you create a gap between grid items?',
                options: ['margin', 'padding', 'gap', 'spacing'],
                correct: 2,
                explanation: 'The `gap` property (formerly grid-gap) creates space between grid rows and columns.'
              },
              {
                question: 'What is the purpose of `grid-template-areas`?',
                options: [
                  'To set background colors',
                  'To name sections of the grid for easy placement',
                  'To create responsive images',
                  'To add animations'
                ],
                correct: 1,
                explanation: 'grid-template-areas lets you name different areas of your grid, making it easy to visually place items with the grid-area property.'
              },
              {
                question: 'Which property would you use to make an item span multiple columns?',
                options: ['grid-span', 'grid-column', 'grid-merge', 'col-span'],
                correct: 1,
                explanation: 'Use `grid-column: start / end` to make an item span multiple columns. For example: `grid-column: 1 / 3;` spans from column line 1 to 3.'
              }
            ]
          }
        }
        ],

    finalQuiz: [
 {
          question: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Hyper Transfer Markup Language',
            'Home Tool Markup Language'
          ],
          correct: 0,
          explanation: 'HTML stands for HyperText Markup Language.'
        },
        {
          question: 'Which CSS property controls the text size?',
          options: ['text-size', 'font-size', 'text-style', 'size'],
          correct: 1,
          explanation: 'font-size sets the size of text.'
        },
        {
          question: 'What is the correct HTML for creating a hyperlink?',
          options: [
            '<a url="http://example.com">Click</a>',
            '<a href="http://example.com">Click</a>',
            '<link>http://example.com</link>',
            '<a>http://example.com</a>'
          ],
          correct: 1,
          explanation: 'The <a> tag with href attribute creates hyperlinks.'
        },
        {
          question: 'Which CSS selector has the highest specificity?',
          options: [
            'Element selector (p)',
            'Class selector (.class)',
            'ID selector (#id)',
            'Universal selector (*)'
          ],
          correct: 2,
          explanation: 'ID selectors have the highest specificity (100 points), followed by classes (10 points), then elements (1 point).'
        },
        {
          question: 'What is the purpose of the alt attribute in images?',
          options: [
            'To specify image size',
            'To provide alternative text for accessibility',
            'To link to the image',
            'To add a caption'
          ],
          correct: 1,
          explanation: 'alt text is crucial for accessibility and SEO, describing images to screen readers.'
        },
        {
          question: 'Which property creates space BETWEEN elements?',
          options: ['padding', 'margin', 'spacing', 'gap'],
          correct: 1,
          explanation: 'Margin creates space outside an element, between it and other elements.'
        },
        {
          question: 'What is the correct CSS syntax to make all paragraphs bold?',
          options: [
            'p {text-size: bold;}',
            'p {font-weight: bold;}',
            'p {font-style: bold;}',
            'all p {bold: true;}'
          ],
          correct: 1,
          explanation: 'font-weight: bold; makes text bold.'
        },
        {
          question: 'Which HTML element is used to create an unordered list?',
          options: ['<ol>', '<li>', '<ul>', '<list>'],
          correct: 2,
          explanation: '<ul> creates bulleted lists, <ol> creates numbered lists.'
        },
        {
          question: 'What does `box-sizing: border-box;` do?',
          options: [
            'Adds a border to the box',
            'Makes width and height include padding and border',
            'Changes the box color',
            'Removes the margin'
          ],
          correct: 1,
          explanation: '`box-sizing: border-box;` makes width and height include padding and border, making layout calculations much easier.'
        },
        {
          question: 'Which property controls alignment on the main axis in Flexbox?',
          options: ['align-items', 'justify-content', 'align-content', 'flex-direction'],
          correct: 1,
          explanation: 'justify-content controls alignment on the main axis in Flexbox.'
        },
        {
          question: 'What is the default value of `position` in CSS?',
          options: ['relative', 'absolute', 'static', 'fixed'],
          correct: 2,
          explanation: 'The default position value is "static", meaning elements follow the normal document flow.'
        },
        {
          question: 'Which CSS unit is relative to the parent element\'s font size?',
          options: ['px', 'em', 'rem', 'vh'],
          correct: 1,
          explanation: 'em is relative to the parent element\'s font size, while rem is relative to the root font size.'
        },
        {
          question: 'What does `display: flex;` do?',
          options: [
            'Hides the element',
            'Creates a flex container',
            'Makes text flexible',
            'Adds flexibility to layout'
          ],
          correct: 1,
          explanation: 'display: flex; creates a flex container, enabling flexbox layout for its direct children.'
        },
        {
          question: 'Which pseudo-class selects elements when hovered?',
          options: [':active', ':focus', ':hover', ':link'],
          correct: 2,
          explanation: ':hover applies styles when the user mouses over an element.'
        },
        {
          question: 'What is the main difference between Flexbox and Grid?',
          options: [
            'Flexbox is newer than Grid',
            'Flexbox is for 1D layouts, Grid for 2D layouts',
            'Grid is only for desktop layouts',
            'They are the same thing'
          ],
          correct: 1,
          explanation: 'Flexbox is one-dimensional (rows OR columns), while Grid is two-dimensional (rows AND columns simultaneously).'
        }
      ]
    };
    

  await FirebaseService.getDb()
    .collection("modules")
    .doc("html-css")
    .set(moduleData);

  console.log("✅ Module uploaded successfully");
}