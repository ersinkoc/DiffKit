import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import ExamplesPage from './pages/ExamplesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="docs/*" element={<DocsPage />} />
        <Route path="examples/*" element={<ExamplesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
