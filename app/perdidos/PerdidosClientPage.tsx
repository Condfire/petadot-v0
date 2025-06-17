'use client';

import { useEffect, useState } from 'react';
import { Pet } from '@/utils/types';

interface Props {
  pets: Pet[];
}

const PerdidosClientPage: React.FC<Props> = ({ pets }) => {
  // No início do componente, adicionar log dos pets
  console.log('[PerdidosClientPage] Pets recebidos:', pets?.map(pet => ({
    id: pet.id,
    name: pet.name,
    main_image_url: pet.main_image_url,
    slug: pet.slug,
    category: pet.category
  })))

  return (
    <div>
      <h1>Pets Perdidos</h1>
      {/* Display pets here */}
    </div>
  );
};

export default PerdidosClientPage;
