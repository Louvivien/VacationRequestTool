import React from 'react';
import { FormControl, FormLabel, VStack, Textarea, Button } from '@chakra-ui/react';

const CSVImporter = ({ csvData, setCsvData, addUsersFromCSV }) => {
  return (
    <VStack spacing={4} p={4} borderWidth="1px" borderRadius="lg">
      <FormControl>
        <FormLabel>Importer des utilisateurs à partir d'un fichier CSV</FormLabel>
        <Textarea value={csvData} onChange={(e) => setCsvData(e.target.value)} placeholder="Collez ici les données CSV" size="sm" height="200px" />
        <Button colorScheme="blue" onClick={addUsersFromCSV}>Importer</Button>
      </FormControl>
    </VStack>
  );
};

export default CSVImporter;