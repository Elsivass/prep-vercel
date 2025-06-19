import { useState } from 'react';

export default function App() {
  // Datos iniciales simulados
  const initialCandidates = [
    { id: 1, name: 'Carlos Sánchez', party: 'Partido Azul', color: '#3B82F6', image: 'https://placehold.co/100x100?text=Carlos' },
    { id: 2, name: 'María López', party: 'Partido Verde', color: '#10B981', image: 'https://placehold.co/100x100?text=María' }, 
    { id: 3, name: 'Javier Morales', party: 'Partido Rojo', color: '#EF4444', image: 'https://placehold.co/100x100?text=Javier' },
  ];

  const initialDistricts = [
    {
      id: 1,
      name: 'Distrito Norte',
      abstention: 2000,
      results: {
        1: 4000,
        2: 6000,
        3: 2000
      }
    },
    {
      id: 2,
      name: 'Distrito Centro',
      abstention: 3000,
      results: {
        1: 5000,
        2: 7000,
        3: 3000
      }
    },
    {
      id: 3,
      name: 'Distrito Sur',
      abstention: 1500,
      results: {
        1: 3000,
        2: 4000,
        3: 3000
      }
    }
  ];

  // Estados principales
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [candidates, setCandidates] = useState(initialCandidates);
  const [districts, setDistricts] = useState(initialDistricts);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Calcular votos totales por candidato desde todos los distritos
  const getCandidateVotes = (candidateId) => {
    return districts.reduce((total, district) => {
      return total + (district.results[candidateId] || 0);
    }, 0);
  };

  // Total de votos contabilizados
  const getTotalVotes = () => {
    return candidates.reduce((sum, candidate) => sum + getCandidateVotes(candidate.id), 0);
  };

  // Total de abstenciones
  const getTotalAbstention = () => {
    return districts.reduce((sum, d) => sum + d.abstention, 0);
  };

  // Porcentaje de participación ciudadana
  const getParticipationRate = () => {
    const total = getTotalVotes() + getTotalAbstention();
    return total > 0 ? ((getTotalVotes() / total) * 100).toFixed(1) : 0;
  };

  // Porcentaje de abstención
  const getAbstentionRate = () => {
    const total = getTotalVotes() + getTotalAbstention();
    return total > 0 ? ((getTotalAbstention() / total) * 100).toFixed(1) : 0;
  };

  // Porcentaje de votos por candidato
  const getVotePercentage = (candidateId) => {
    const votes = getCandidateVotes(candidateId);
    const total = getTotalVotes();
    return total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
  };

  // Ordenar candidatos por votos totales
  const sortedCandidates = [...candidates].sort((a, b) => {
    const aVotes = getCandidateVotes(a.id);
    const bVotes = getCandidateVotes(b.id);
    return bVotes - aVotes;
  });

  const winner = sortedCandidates[0];

  // Iniciar sesión como admin
  const handleLogin = () => {
    if (password === 'prepadmin123') {
      setIsAdmin(true);
      setActiveTab('admin-panel');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Funciones para el modo administrador
  const addCandidate = (newCandidate) => {
    const newId = Math.max(...candidates.map(c => c.id), 0) + 1;
    setCandidates([...candidates, { ...newCandidate, id: newId }]);
  };

  const updateCandidate = (id, updatedData) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteCandidate = (id) => {
    setCandidates(candidates.filter(c => c.id !== id));
    const updatedDistricts = districts.map(district => {
      const results = { ...district.results };
      delete results[id];
      return { ...district, results };
    });
    setDistricts(updatedDistricts);
  };

  const updateDistrictVotes = (districtId, candidateId, newVotes) => {
    const numericVotes = parseInt(newVotes) || 0;
    setDistricts(districts.map(district => {
      if (district.id === districtId) {
        const updatedResults = { ...district.results, [candidateId]: numericVotes };
        return { ...district, results: updatedResults };
      }
      return district;
    }));
  };

  const updateDistrictName = (id, newName) => {
    setDistricts(districts.map(d => d.id === id ? { ...d, name: newName } : d));
  };

  const addDistrict = () => {
    const newId = Math.max(...districts.map(d => d.id), 0) + 1;
    setDistricts([
      ...districts,
      {
        id: newId,
        name: `Nuevo Distrito ${newId}`,
        abstention: 0,
        results: {}
      }
    ]);
  };

  // Renderizado del gráfico de torta (simple SVG)
  const renderPieChart = () => {
    let cumulativeAngle = 0;
    const radius = 80;
    const cx = 100;
    const cy = 100;

    const total = getTotalVotes();

    return (
      <svg width="200" height="200" viewBox="0 0 200 200">
        {sortedCandidates.map(candidate => {
          const votes = getCandidateVotes(candidate.id);
          const percentage = total > 0 ? votes / total : 0;
          const angle = percentage * 360;

          const endX = cx + radius * Math.cos((cumulativeAngle * Math.PI) / 180);
          const endY = cy + radius * Math.sin((cumulativeAngle * Math.PI) / 180);
          const largeArcFlag = angle > 180 ? 1 : 0;
          const x1 = cx + radius * Math.cos(((cumulativeAngle + angle) * Math.PI) / 180);
          const y1 = cy + radius * Math.sin(((cumulativeAngle + angle) * Math.PI) / 180);

          const pathData = `
            M ${cx} ${cy}
            L ${endX} ${endY}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x1} ${y1}
            Z
          `;

          cumulativeAngle += angle;

          return (
            <path key={candidate.id} d={pathData} fill={candidate.color} />
          );
        })}
      </svg>
    );
  };

  // Renderizado condicional según pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Resultados Generales</h2>

            {/* Tarjetas de participación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Participación Ciudadana</h3>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${getParticipationRate()}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{getTotalVotes().toLocaleString()} votos contabilizados de {(getTotalVotes() + getTotalAbstention()).toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Abstención</h3>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-red-500 h-4 rounded-full"
                    style={{ width: `${getAbstentionRate()}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{getTotalAbstention().toLocaleString()} ciudadanos no votaron</p>
              </div>
            </div>

            {/* Candidatos destacados */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Candidatos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className={`p-4 border rounded-lg ${
                      candidate.id === winner.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {candidate.id === winner.id && (
                      <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-full mb-2">
                        Ganador
                      </span>
                    )}
                    <img src={candidate.image} alt={candidate.name} className="w-16 h-16 rounded-full mx-auto mb-3" />
                    <h4 className="font-bold text-center">{candidate.name}</h4>
                    <p className="text-sm text-center text-gray-600">{candidate.party}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>{getCandidateVotes(candidate.id).toLocaleString()} votos</span>
                        <span>{getVotePercentage(candidate.id)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${getVotePercentage(candidate.id)}%`, backgroundColor: candidate.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de torta */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Distribución de Votos</h3>
              {renderPieChart()}
            </div>

            {/* Listado ordenado */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Ranking por Votos</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCandidates.map((candidate, index) => (
                    <tr key={candidate.id} className={index === 0 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{candidate.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{candidate.party}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getCandidateVotes(candidate.id).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getVotePercentage(candidate.id)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'districts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Resultados por Distrito</h2>

            {/* Lista de distritos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {districts.map(district => {
                const totalVotesInDistrict = Object.values(district.results).reduce((sum, v) => sum + v, 0);
                const totalPossible = totalVotesInDistrict + district.abstention;
                const participation = totalPossible > 0 ? ((totalVotesInDistrict / totalPossible) * 100).toFixed(1) : 0;

                return (
                  <div
                    key={district.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-transform hover:scale-105 ${
                      selectedDistrict?.id === district.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedDistrict(selectedDistrict?.id === district.id ? null : district)}
                  >
                    <h3 className="font-bold text-lg">{district.name}</h3>
                    <p className="text-sm text-gray-600">
                      Votos: {totalVotesInDistrict.toLocaleString()} ({participation}%)
                    </p>
                    <p className="text-sm text-gray-600">
                      Abstención: {district.abstention.toLocaleString()}
                    </p>
                    {selectedDistrict?.id === district.id && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">Ganador actual:</h4>
                        {winner && (
                          <div className="flex items-center space-x-2">
                            <img src={winner.image} alt={winner.name} className="w-8 h-8 rounded-full" />
                            <div>
                              <p className="font-medium">{winner.name}</p>
                              <p className="text-xs text-gray-500">{winner.party}</p>
                            </div>
                          </div>
                        )}

                        {/* Tabla de resultados detallados */}
                        <table className="min-w-full mt-2">
                          <thead>
                            <tr>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidato</th>
                              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Votos</th>
                              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Votos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidates.map(candidate => {
                              const votes = district.results[candidate.id] || 0;
                              const total = Object.values(district.results).reduce((sum, v) => sum + v, 0);
                              const percentage = total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
                              return (
                                <tr key={candidate.id}>
                                  <td className="py-1 text-sm">
                                    <div className="flex items-center">
                                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: candidate.color }}></div>
                                      {candidate.name}
                                    </div>
                                  </td>
                                  <td className="py-1 text-right text-sm">{votes.toLocaleString()}</td>
                                  <td className="py-1 text-right text-sm">{percentage}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'admin-login':
        return (
          <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Acceso al Modo Administrador</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              />
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        );

      case 'admin-panel':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>

            {/* Agregar nuevo candidato */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Candidato</h3>
              <AddCandidateForm onAdd={addCandidate} />
            </div>

            {/* Editar candidatos existentes */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Editar Candidatos Existentes</h3>
              <div className="space-y-4">
                {candidates.map(candidate => (
                  <EditCandidateForm
                    key={candidate.id}
                    candidate={candidate}
                    onUpdate={(data) => updateCandidate(candidate.id, data)}
                    onDelete={() => deleteCandidate(candidate.id)}
                  />
                ))}
              </div>
            </div>

            {/* Editar votos por distrito */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Editar Votos por Distrito</h3>
              <button
                onClick={addDistrict}
                className="mb-4 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-colors"
              >
                Agregar Distrito
              </button>
              <div className="space-y-6">
                {districts.map(district => (
                  <div key={district.id} className="border rounded p-4">
                    <input
                      type="text"
                      value={district.name}
                      onChange={(e) => updateDistrictName(district.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded mb-3"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidates.map(candidate => (
                        <div key={candidate.id} className="flex items-center">
                          <label className="w-1/3 font-medium">{candidate.name}:</label>
                          <input
                            type="number"
                            min="0"
                            value={district.results[candidate.id] || 0}
                            onChange={(e) => updateDistrictVotes(district.id, candidate.id, e.target.value)}
                            className="w-2/3 p-2 border border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PREP Electorales</h1>
          <nav className="space-x-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`text-sm font-medium ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('districts')}
              className={`text-sm font-medium ${activeTab === 'districts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            >
              Distritos
            </button>
            {!isAdmin ? (
              <button
                onClick={() => setActiveTab('admin-login')}
                className="text-sm font-medium text-gray-600 hover:text-blue-500"
              >
                Admin
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('admin-panel')}
                className={`text-sm font-medium ${activeTab === 'admin-panel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                Panel Admin
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="main-container">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner mt-12 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} PREP Electorales | Programa de Resultados Preliminares
        </div>
      </footer>
    </div>
  );
}

// Componente para agregar un nuevo candidato
function AddCandidateForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    image: 'https://placehold.co/100x100?text=Nuevo',
    color: '#3B82F6' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      name: '',
      party: '',
      image: 'https://placehold.co/100x100?text=Nuevo',
      color: '#3B82F6' 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Partido</label>
        <input
          type="text"
          required
          value={formData.party}
          onChange={(e) => setFormData({ ...formData, party: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="h-8 w-16"
          />
          <span className="text-sm">{formData.color}</span>
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Agregar Candidato
      </button>
    </form>
  );
}

// Componente para editar un candidato existente
function EditCandidateForm({ candidate, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...candidate });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="border rounded p-4 hover:bg-gray-50 transition-colors">
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-start space-x-4">
            <img src={formData.image} alt="Vista previa" className="w-16 h-16 rounded object-cover" />
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partido</label>
                <input
                  type="text"
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-8 w-16"
                  />
                  <span className="text-sm">{formData.color}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={candidate.image} alt={candidate.name} className="w-12 h-12 rounded" />
            <div>
              <h4 className="font-medium">{candidate.name}</h4>
              <p className="text-sm text-gray-600">{candidate.party}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="text-sm bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}