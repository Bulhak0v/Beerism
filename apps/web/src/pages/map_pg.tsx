import React, { useState, useCallback, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

// ====================================================================
// НОВЫЙ ХУК ДЛЯ АДАПТИВНОСТИ
// ====================================================================
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Запускаем слушателя
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};
// ====================================================================


// ... (Location Interface, defaultCenter - без изменений)
interface Location {
  location_id: string;
  name: string;
  description: string;
  adress: string;
  average_budget_requirment: "Low" | "Medium" | "High";
  city: string;
  closes_at: string;
  opens_at: string;
  latitude: number;
  longtitude: number;
  picture: string | null;
  rating: number;
  website: string;
}

const defaultCenter = {
  lat: 50.4501, 
  lng: 30.5234, 
};

const MapPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<Location | null>(null);
  
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  
  // ИСПОЛЬЗУЕМ НОВЫЙ ХУК
  const isMobile = useIsMobile(); 

  // СТИЛЬ КОНТЕЙНЕРА КАРТЫ АДАПТИРОВАН
  const mapContainerStyle = useMemo(() => ({
      width: "100%",
      height: isMobile ? "60vh" : "75vh", // Динамическая высота
      borderRadius: "0",
  }), [isMobile]);

  // 1. Инициализация API Google Maps (без изменений)
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDi4S7u2L4oxzpOa3dNIyytp2Igly6fBVw", 
  });

  const navigate = useNavigate();

  // 2. Загрузка данных (без изменений)
  const fetchAllLocations = useCallback(async () => {
    try {
      const res = await fetch(`https://beerism-backend.onrender.com/api/locations`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      const data: Location[] = await res.json();
      
      const validLocations = data.filter(loc => 
        typeof loc.latitude === 'number' && loc.latitude >= -90 && loc.latitude <= 90 &&
        typeof loc.longtitude === 'number' && loc.longtitude >= -180 && loc.longtitude <= 180
      );

      setLocations(validLocations);
    } catch (err: any) {
      setError(err.message || "Error fetching locations");
    }
  }, []);
  
  useEffect(() => {
    fetchAllLocations();
  }, [fetchAllLocations]);

  // 3. Логика фильтрации (без изменений)
  const filteredLocations = useMemo(() => {
    let current = locations;

    if (selectedBudget) {
        current = current.filter(loc => loc.average_budget_requirment === selectedBudget);
    }
    if (selectedStyle === 'Dunkel') {
        current = current.filter(loc => loc.description.toLowerCase().includes('темне') || loc.description.toLowerCase().includes('стаут'));
    } else if (selectedStyle === 'IPA') {
        current = current.filter(loc => loc.description.toLowerCase().includes('ipa') || loc.name.toLowerCase().includes('point'));
    }
    if (selectedAtmosphere === 'Historic') {
        current = current.filter(loc => loc.description.toLowerCase().includes('історична') || loc.city === 'Львів');
    } else if (selectedAtmosphere === 'Modern') {
        current = current.filter(loc => loc.description.toLowerCase().includes('модний') || loc.city === 'Одеса');
    }

    return current;
  }, [locations, selectedBudget, selectedStyle, selectedAtmosphere]);

  // 4. Вычисление центра карты (без изменений)
  const mapCenter = useMemo(() => {
      if (filteredLocations.length > 0) {
          const avgLat = filteredLocations.reduce((sum, loc) => sum + loc.latitude, 0) / filteredLocations.length;
          const avgLng = filteredLocations.reduce((sum, loc) => sum + loc.longtitude, 0) / filteredLocations.length;
          return { lat: avgLat, lng: avgLng };
      }
      return defaultCenter;
  }, [filteredLocations]);

  // 5. Отрисовка
  return (
    <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F5F5DC', 
        padding: '0' 
    }}>
      {/* 1. ХЭДЕР / ЛОГОТИП */}
      <header style={{ 
          padding: isMobile ? '10px 15px' : '20px 50px', 
          height: isMobile ? '70px' : '100px', 
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'white',
          justifyContent: isMobile ? 'space-between' : 'flex-start', 
      }}>
          <div 
              className="logo"
              style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#5C4033', 
              }}
          >
              <img 
                  src="logo.svg" 
                  alt="logo" 
                  style={{ 
                      height: isMobile ? '40px' : '60px', 
                      marginRight: isMobile ? '10px' : '15px',
                  }} 
              />
              <h1 
                  className="title"
                  style={{
                      fontSize: isMobile ? '22px' : '28px', 
                      margin: 0,
                      fontWeight: 'bold',
                  }}
              >
                  Beerism
              </h1>
          </div>
          {/* Кнопка "Назад" перемещена в Header на мобильном */}
          {isMobile && (
              <button 
                  onClick={() => navigate("/profile")}
                  style={{
                      padding: '8px 15px',
                      backgroundColor: 'white',
                      color: '#5C4033',
                      border: '1px solid #5C4033',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      whiteSpace: 'nowrap'
                  }}
              >
                  ← Back
              </button>
          )}
      </header>

      <div style={{ padding: isMobile ? '0 15px' : '0 50px' }}>
        {/* 2. ПАНЕЛЬ УПРАВЛЕНИЯ И ЗАГОЛОВОК (АДАПТИРОВАН) */}
        <div style={{ 
            marginTop: isMobile ? '20px' : '30px', 
            marginBottom: '20px', 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            justifyContent: 'space-between' 
        }}>
            
            <h1 style={{ 
                fontSize: isMobile ? '30px' : '40px', 
                color: '#5C4033',
                padding: '5px 15px',
                backgroundColor: '#D9FFD9', 
                display: 'inline-block',
                margin: isMobile ? '0 0 15px 0' : 0 
            }}>
                Locations
            </h1>

            {/* КОНТЕЙНЕР ФИЛЬТРОВ (АДАПТИРОВАН) */}
            <div style={{ 
                display: 'flex', 
                gap: isMobile ? '10px' : '15px',
                flexDirection: isMobile ? 'column' : 'row', // ВЕРТИКАЛЬНАЯ КОМПОНОВКА ФИЛЬТРОВ
                width: isMobile ? '100%' : 'auto', 
            }}>
                
                <FilterDropdown 
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    options={[{ label: 'High Budget', value: 'High' }, { label: 'Medium Budget', value: 'Medium' }, { label: 'Low Budget', value: 'Low' }]}
                    defaultLabel="Select Budget" 
                    isMobile={isMobile} // Передаем состояние мобильности
                />

                <FilterDropdown 
                    value={selectedAtmosphere}
                    onChange={(e) => setSelectedAtmosphere(e.target.value)}
                    options={[{ label: 'Historic', value: 'Historic' }, { label: 'Modern', value: 'Modern' }, { label: 'Cozy', value: 'Cozy' }]}
                    defaultLabel="Select Atmosphere" 
                    isMobile={isMobile} // Передаем состояние мобильности
                />

                <FilterDropdown 
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    options={[{ label: 'Dunkel', value: 'Dunkel' }, { label: 'IPA', value: 'IPA' }, { label: 'Lager', value: 'Lager' }]}
                    defaultLabel="Select Style"
                    isMobile={isMobile} // Передаем состояние мобильности
                />
                
                {/* Кнопка "Назад" скрыта на десктопе */}
                {!isMobile && (
                    <button 
                        onClick={() => navigate("/profile")}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#5C4033',
                            border: '1px solid #5C4033',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        ← Back
                    </button>
                )}
            </div>
        </div>
        
        {error && <p style={{ color: 'red' }}>**Ошибка загрузки данных:** {error}</p>}
        {filteredLocations.length === 0 && (selectedBudget || selectedStyle || selectedAtmosphere) && (
             <p style={{ color: '#5C4033' }}>По текущим фильтрам заведений не найдено.</p>
        )}
        
        {/* 3. КОНТЕЙНЕР КАРТЫ */}
        <div style={{ border: '1px solid #ddd', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter} 
                    zoom={ filteredLocations.length > 1 ? 6 : 10 } 
                    options={{ 
                        disableDefaultUI: false, 
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                            { featureType: "landscape", stylers: [{ color: "#e6ffe6" }] }
                        ],
                    }}
                    onClick={() => setActiveMarker(null)}
                >
                    
                    {filteredLocations.map((location) => (
                        <Marker
                            key={location.location_id}
                            position={{
                                lat: location.latitude,
                                lng: location.longtitude,
                            }}
                            title={location.name} 
                            onClick={() => setActiveMarker(location)}
                        />
                    ))}

                    {activeMarker && (
                        <InfoWindow
                            position={{ lat: activeMarker.latitude, lng: activeMarker.longtitude }}
                            onCloseClick={() => setActiveMarker(null)}
                        >
                            <div style={{ padding: '5px', maxWidth: isMobile ? '200px' : '300px' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: isMobile ? '16px' : '18px' }}>{activeMarker.name}</h3>
                                <p style={{ margin: '0 0 10px 0', fontSize: isMobile ? '12px' : '14px', color: '#555' }}>
                                    {activeMarker.description.substring(0, 100)}...
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: isMobile ? '11px' : '13px' }}>
                                    <li>⭐ **Рейтинг:** {activeMarker.rating}</li>
                                    <li>💰 **Бюджет:** {activeMarker.average_budget_requirment}</li>
                                    <li>🏙️ **Адрес:** {activeMarker.adress}, {activeMarker.city}</li>
                                    <li>⏱️ **Часы работы:** {activeMarker.opens_at.substring(0, 5)} - {activeMarker.closes_at.substring(0, 5)}</li>
                                    <li>🌐 **Сайт:** <a href={activeMarker.website} target="_blank" rel="noopener noreferrer">Перейти</a></li>
                                </ul>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            ) : (
                <div style={{...mapContainerStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6ffe6'}}>
                    <p>Загрузка Google Maps API...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// Вспомогательный компонент FilterDropdown (ИСПРАВЛЕН)
// ====================================================================

interface DropdownOption {
    label: string;
    value: string;
}

interface FilterDropdownProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: DropdownOption[];
    defaultLabel: string;
    isMobile: boolean; // Используем для стилизации
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange, options, defaultLabel, isMobile }) => {
    
    // Стили, зависящие от isMobile
    const selectStyle: React.CSSProperties = {
        padding: isMobile ? '12px 15px' : '10px 15px', 
        backgroundColor: 'white',
        color: '#5C4033',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: isMobile ? '16px' : '14px', 
        fontWeight: 'bold',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%235C4033' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '30px',
        minWidth: isMobile ? '100%' : '150px', // Растягиваем на всю ширину на мобильном
    };

    return (
        <select value={value} onChange={onChange} style={selectStyle}>
            <option value="">{defaultLabel}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

// Экспорт компонента по умолчанию
export default MapPage;