import React from 'react';

interface NavigationProps {
   currentPage: string;
   onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
   const pages = [
      { id: 'home', label: 'Accueil' },
      { id: 'pantry', label: 'Garde-manger' },
      { id: 'planning', label: 'Planning' }
   ];

   return (
      <nav style={{
         padding: '1rem',
         borderBottom: '1px solid #ccc',
         marginBottom: '2rem',
         backgroundColor: '#f8f9fa'
      }}>
         <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {pages.map(page => (
               <button
                  key={page.id}
                  onClick={() => onPageChange(page.id)}
                  style={{
                     padding: '0.5rem 1rem',
                     border: 'none',
                     borderRadius: '4px',
                     backgroundColor: currentPage === page.id ? '#007bff' : '#fff',
                     color: currentPage === page.id ? '#fff' : '#007bff',
                     cursor: 'pointer',
                     fontWeight: currentPage === page.id ? 'bold' : 'normal'
                  }}
               >
                  {page.label}
               </button>
            ))}
         </div>
      </nav>
   );
};

export default Navigation;