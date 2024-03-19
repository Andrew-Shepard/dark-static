import React, { useState } from 'react';
import { Button, Form, Container, Navbar, Nav } from 'react-bootstrap';

function extractReadableContent(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  // Query for text nodes and elements that can contain text content you're interested in
  const contentNodes = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a');
  let extractedContent = [];

  contentNodes.forEach(node => {
    if (node.tagName.toLowerCase() === 'a') {
      // Avoid duplicating link text; ensure this node's text isn't added again
      // Add the link as an object for special handling, preserving href and text
      extractedContent.push({type: 'link', href: node.href, content: node.textContent});
    } else {
      // Directly include the text content for non-link nodes
      if (!node.closest('a')) { // Avoid adding text already included in an 'a' tag
        extractedContent.push({type: node.tagName.toLowerCase(), content: node.innerText || node.textContent});
      }
    }
  });

  return extractedContent;
}
function App() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState([]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      const readableContent = extractReadableContent(data.contents); // Make sure this function is adjusted as previously described
      setContent(readableContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([{ type: 'text', content: 'Failed to load content. This could be due to CORS policies.' }]);
    }
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchContent();
  };

  // A function to render the content based on its type
  const renderContent = () => {
    return content.map((item, index) => {
      if (item.type === 'link') {
        // Render link with custom styling
        return (
          <div key={index} style={{ margin: '5px 0' }}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: '#78909C' }}>{item.content}</a>
          </div>
        );
      } else {
        // Render text
        return <p key={index} style={item.type.startsWith('h') ? { fontWeight: 'bold' } : {}}>{item.content}</p>;
      }
    });
  };

  return (
    <div className="bg-dark text-white" style={{ minHeight: "100vh" }}>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">URL Reader</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <Form onSubmit={handleSubmit} className="my-3">
          <Form.Group>
            <Form.Label>Enter URL</Form.Label>
            <Form.Control type="text" value={url} onChange={handleInputChange} placeholder="https://example.com" />
          </Form.Group>
          <Button variant="secondary" type="submit" className="my-2">
            Fetch Content
          </Button>
        </Form>
        <div>
          {renderContent()}
        </div>
      </Container>
    </div>
  );
}

export default App;
