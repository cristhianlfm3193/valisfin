const fs = require('fs');

const vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'; // Andrés Chávez

const URLS = {
  'Distribuidora': 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80',
  'Tienda': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'Restaurante': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
  'Supermercado': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
  'Mini Super': 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80'
};

const mapCategory = (raw) => {
  const cat = raw.toLowerCase();
  if (cat.includes('panadería')) return 'Tienda';
  if (cat.includes('restaurante')) return 'Restaurante';
  if (cat.includes('supermercado cadena')) return 'Supermercado';
  if (cat.includes('supermercado')) return 'Supermercado';
  if (cat.includes('mini super')) return 'Mini Super';
  if (cat.includes('industria')) return 'Distribuidora';
  if (cat.includes('almacen')) return 'Distribuidora';
  if (cat.includes('distribuidora')) return 'Distribuidora';
  return raw; // default
};

const rows = [
  ["Casa El Distribuidor", "Distribuidora", "Panamá Oeste, La Chorrera, Av. Libertador, Casa 3525", 8.879282, -79.781709],
  ["Casa Zing", "Distribuidora", "Panamá Oeste, La Chorrera, Urb. Frente al Parque Libertador", 8.879434, -79.784445],
  ["Central de productos y Equipos GC", "Panadería", "Panamá Oeste, La Chorrera, Planta, Calle Naciones Unidas Edf. Fatima", 8.879597, -79.785364],
  ["Compañía Goly, S.A. - Compañía Goly, S.A.- Coronado", "Supermercado Cadena", "Panamá Oeste, Chame (Cabecera), Coronado, Vía Interamericana, Edf. CC P.H. The Village", 8.530834, -79.903276],
  ["Compañía Goly, S.A. - Compañía Goly, S.A.-Hato Montaña", "Supermercado Cadena", "Panamá Oeste, Juan Demóstenes Arosemena, Vía Interamericana, Edf. CC Hato Montaña", 8.920935, -79.709539],
  ["Criollissimo", "Restaurante", "Panamá Oeste, Arraiján, Vista Alegre, Westland Mall, Dep. FC-10", 8.920516, -79.705655],
  ["Delicias Cardona", "Restaurante", "Panamá Oeste, Burunga, Arraiján", 8.906593, -79.835502],
  ["Distribuidora Cielo Azul", "Distribuidora", "Panamá Oeste, La Chorrera, Detrás del Mercado de Abastos", 8.87779, -79.77851],
  ["Distribuidora David Zhang", "Distribuidora", "Panamá Oeste, Arraiján, Urb. Vista Alegre, Nuevo Arraijan, Calle 7ma, Vía Matadero, Local 2", 8.925412, -79.703625],
  ["Distribuidora Frutas y Vegetales Tito", "Distribuidora", "Panamá Oeste, La Chorrera, Barrio Colón, Ave. Mariano Rivera", 8.870158, -79.779841],
  ["Distribuidora Jun", "Distribuidora", "Panamá Oeste, La Chorrera, Calle Del Puerto", 8.878972, -79.778955],
  ["Distribuidora Kingdom", "Distribuidora", "Panamá Oeste, La Chorrera, Barrio Colón, Calle del Puerto casa 3791", 8.870122, -79.779445],
  ["Distribuidora Mayorista Angelica", "Distribuidora", "Panamá Oeste, Carretera Panamericana, Vista Alegre", 8.928112, -79.702885],
  ["Distribuidora Mayorista Angelica : Distribuidora Mayorista Angelica", "Distribuidora", "Panamá Oeste, La Chorrera, Frente a Banco Mercantil cerca de banistmo, Calle Las Américas, Barrio Balboa", 8.872039, -79.781359],
  ["Distribuidora Mayorista Angelica : Distribuidora Mayorista Angelica N 2", "Distribuidora", "Panamá Oeste, Arraiján, Vista Alegre, Vía Panamericana, Urb. Residencial Vista Alegre, Edf. Angelica, Local N 2", 8.925909, -79.701545],
  ["Distribuidora Mayorista Angelica CH- NO USAR", "Distribuidora", "Panamá Oeste, Arraiján, Vista Alegre, Vía Panamericana, Dep. 2., Urb. Residencial Vista Alegre", 8.924961, -79.702331],
  ["Distribuidora Pompon", "Distribuidora", "Panamá Oeste, Arraiján, Juan Demóstenes, Calle 1ra, Mercadito Nuevo Arraiján", 8.932954, -79.685332],
  ["Distribuidora Prosperidad, S.A", "Distribuidora", "Panamá Oeste, La Chorrera, Avenida de las Américas, Edif. 3520", 8.877929, -79.781639],
  ["Distribuidora Real Lio", "Distribuidora", "Panamá Oeste, Capira, Villa Rosario, Urb. Villa Milagro", 8.775432, -79.850935],
  ["Distribuidora Smart", "Distribuidora", "Panamá Oeste, Capira, Cabecera, Vía Interamericana", 8.758421, -79.866451],
  ["Distribuidora Victoria Sofia", "Distribuidora", "Panamá Oeste, Arraiján, Vista Alegre, Frente al Super 15 Rex. Vía Principal", 8.92762, -79.703922],
  ["Distribuidora 168", "Distribuidora", "Panamá Oeste, La Chorrera, Barrio Colón, Ave. Mariano Rivera", 8.870086, -79.780429],
  ["Distribuidora 3 Estrellas", "Distribuidora", "Panamá Oeste, La Chorrera, Barrio Colón, Frente al Mercado de abastos", 8.879852, -79.781258],
  ["El Peruano Ceviches", "Restaurante", "Panamá Oeste, La Chorrera, Barrio Colón, Urb. Calle Larga, Ave. San Martín", 8.878215, -79.778272],
  ["Golden Express", "Restaurante", "Panamá Oeste, Arraiján, Vista Alegre, Westland Mall, FC-8", 8.921397, -79.705656],
  ["Golden Express : Golden Express-La Chorrera", "Restaurante", "Panamá Oeste, La Chorrera, Barrio Colón, Anclas Mall, Carretera principal", 8.880203, -79.784695],
  ["Golden Mini Market : Super Market La Parada", "Supermercado", "Panamá Oeste, La Chorrera, Barrio Colón", 8.878511, -79.779775],
  ["Grupo Benedicto Huang, S.A.", "Distribuidora", "Panamá Oeste, La Chorrera, Guadalupe, Vía Panamericana", 8.867914, -79.801479],
  ["Grupo Yan Xing", "Distribuidora", "Panamá Oeste, Capira, Vía Interamericana, Calle principal Edf. Grupo Yan Xing", 8.755785, -79.865505],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Arraiján", "Supermercado Cadena", "Panamá Oeste, Arraiján, Valle Hermoso", 8.945477, -79.659748],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Arraiján Town Center", "Supermercado Cadena", "Panamá Oeste, Arraiján, Town Center Burunga", 8.947547, -79.65287],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Brisas Del Golf Arraiján", "Supermercado Cadena", "Panamá Oeste, Arraiján, Brisas del Golf", 8.900925, -79.669127],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Coronado", "Supermercado Cadena", "Panamá Oeste, Coronado", 8.530112, -79.906284],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-El Coco", "Supermercado Cadena", "Panamá Oeste, El Coco de La Chorrera", 8.875418, -79.800982],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-La Chorrera", "Supermercado Cadena", "Panamá Oeste, La Chorrera", 8.876771, -79.783358],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-OnD Go Chorrera", "Supermercado Cadena", "Panamá Oeste, OnD Go La Chorrera", 8.870279, -79.778775],
  ["Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Vacamonte", "Supermercado Cadena", "Panamá Oeste, Arraiján, Vacamonte, El Tecal", 8.900636, -79.665585],
  ["Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 15", "Supermercado Cadena", "Panamá Oeste, La Chorrera, Herrera, Vía El Trapichito, Vía principal El Trapichito, Casa S/N", 8.875881, -79.789228],
  ["Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 11", "Supermercado Cadena", "Panamá Oeste, La Chorrera, Puerto Caimito, Vía La Mitra", 8.880284, -79.755005],
  ["Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 13", "Supermercado Cadena", "Panamá Oeste, Barrio Colón, Urb. Barrio El Limón", 8.876265, -79.779022],
  ["Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 9", "Supermercado Cadena", "Panamá Oeste, Arraiján, Vista Alegre, Vía Panamericana", 8.926094, -79.70104],
  ["Industrias Velásquez, S.A.", "Panadería", "Panamá Oeste, Arraiján, Vacamonte, Centro Comercial Tajonaso, Local # 3", 8.900272, -79.667255],
  ["Inversiones Casa Marcelito", "Distribuidora", "Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Las Américas, Detrás de la Estación Delta", 8.880126, -79.778292],
  ["Islas de Panamá NC Limpiada", "Restaurante", "Panamá Oeste, La Chorrera, Barrio Colón, Plaza Uniplaza, Urb. El Limón, Costa Verde, Dep. 4-L5", 8.884287, -79.752282],
  ["Jumbo Market, S.A. : Jumbo Market, S.A.-Arraiján", "Supermercado Cadena", "Panamá Oeste, Arraiján, Juan Demóstenes Arosemena", 8.952524, -79.665859],
  ["Jumbo Market, S.A. : Jumbo Market, S.A.-Costa Verde", "Supermercado Cadena", "Panamá Oeste, La Chorrera, Costa Verde, PH Plaza Central Costa Verde", 8.899025, -79.747525],
  ["Jumbo Market, S.A. : Jumbo Market, S.A.-Vacamonte", "Supermercado Cadena", "Panamá Oeste, Vacamonte, Arraiján, Vista Alegre, Plaza Nueva, Urb. Vacamonte", 8.92629, -79.705667],
  ["Legumbres Araúz", "Mini Super", "Panamá Oeste, La Chorrera, Mercado de Abastos", 8.878786, -79.779741],
  ["Lo Maximo", "Distribuidora", "Panamá Oeste, La Chorrera, Barrio Colón, Calle San Francisco", 8.876256, -79.780305],
  ["Mini Super Jennifer", "Mini Super", "Panamá Oeste, Barrio Balboa, Ave. Las Américas", 8.876734, -79.780785],
  ["Mini Super Mary", "Mini Super", "Panamá Oeste, La Chorrera, El Coco, Calle principal, Urb. El Coco", 8.874196, -79.798867],
  ["Panadería Dulcería y Rest. Cesarin", "Panadería", "Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Las Américas", 8.87603, -79.781846],
  ["Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Barrio Matuna", "Panadería", "Panamá Oeste, La Chorrera, Barrio Matuna, Ave. Las Americas", 8.87741, -79.779892],
  ["Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Capira", "Panadería", "Panamá Oeste, Capira", 8.757933, -79.866254],
  ["Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-C.C. Vista Mar", "Panadería", "Panamá Oeste, La Chorrera, C.C. Vista Mar Frente Al Hospital Nicolas Solano", 8.880072, -79.781276],
  ["Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-El Puerto", "Panadería", "Panamá Oeste, La Chorrera, Calle El Puerto Frente A Estacion Terpel, Cesarin 7", 8.877584, -79.781429],
  ["Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-On D Go La Chorrera", "Panadería", "Panamá Oeste, La Chorrera, On D Go al Lado del Super 99", 8.870655, -79.779054],
  ["Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-San Carlos", "Panadería", "Panamá Oeste, San Carlos", 8.899295, -79.999435],
  ["Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Valle Hermoso", "Panadería", "Panamá Oeste, Arraiján, Valle Hermoso", 8.941995, -79.695692],
  ["Productos Hierro", "Industria", "Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Las Américas, Edif. Lupita, Dep. 2do piso", 8.875515, -79.777556],
  ["Suministros Alimenticios, S.A.", "Supermercado", "Panamá Oeste, La Chorrera, Barrio Balboa, Calle del Puerto Casa 3284", 8.880027, -79.781492],
  ["Super Calidad", "Mini Super", "Panamá Oeste, La Chorrera, Guadalupe, Calle interamericana, Casa 1504", 8.867002, -79.8004],
  ["Super Centro de la Carne #2", "Supermercado", "Panamá Oeste, La Chorrera, Barrio Colón, Vía Rockefeller", 8.86601, -79.777582],
  ["Super Diferente", "Mini Super", "Panamá Oeste, Arraiján, Juan Demóstenes Arosemena, Calle Principal, Urb. Rio Potrero", 8.946766, -79.649676],
  ["Supercentro de la carne", "Mini Super", "Panamá Oeste, La Chorrera, Plaza de la carne", 8.879035, -79.781226],
  ["Supercentro Infinito", "Mini Super", "Panamá Oeste, Arraiján, Cerro silvestre, Nuevo Chorrillo", 8.869016, -79.800195],
  ["Supercentro La Gran Vía", "Supermercado", "Panamá Oeste, Arraiján, Vista Alegre, Autopista", 8.827503, -79.780171],
  ["Superm. y Distribuidora H. D. L.", "Supermercado", "Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Mariano Rivera", 8.880416, -79.782103],
  ["Superm. y May. La Estrella Roja", "Supermercado", "Panamá Oeste, Arraiján, Urb. Caceres, Plaza la Estrella Roja", 8.949642, -79.651477],
  ["Supermarket Vacamonte", "Supermercado", "Panamá Oeste, Vista Alegre, Calle principal, diagonal a Super Jumbo, Plaza Comercial y Brisas de Punta, Urb. Vacamonte, Arraijan", 8.920753, -79.701761],
  ["Supermercado Casa de Oro", "Supermercado", "Panamá Oeste, La Chorrera, El Coco", 8.872007, -79.800716],
  ["Supermercado El Progreso", "Supermercado", "Panamá Oeste, La Chorrera, Feuilleth, Urb. El Espino, Calle Principal", 8.887138, -79.789655],
  ["Supermercado El Surtidor", "Supermercado", "Panamá Oeste, Arraiján, Juan Demóstenes Arosemena", 8.935087, -79.682052],
  ["Supermercado Fou Eleth", "Supermercado", "Panamá Oeste, La Chorrera, Ave. Las Americas", 8.886209, -79.792257],
  ["Supermercado La Hacienda", "Supermercado", "Panamá Oeste, Arraiján, Vista Alegre, Urb. La Hacienda, Calle Providencia La Hacienda", 8.928045, -79.700304],
  ["Supermercado Maxi Carnes", "Supermercado", "Panamá Oeste, Arraiján, Vacamonte, Calle 9na, Principal", 8.89855, -79.605295],
  ["Supermercado Superprecio", "Supermercado", "Panamá Oeste, Arraiján, Arraiján Cabecera, Urb. 7 de septiembre", 8.946833, -79.659966],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Anclas Mall", "Supermercado Cadena", "Panamá Oeste, Anclas Mall", 8.882926, -79.768245],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Arraiján", "Supermercado Cadena", "Panamá Oeste, Arraiján", 8.930024, -79.648061],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Capira", "Supermercado Cadena", "Panamá Oeste, Capira, Villa Carmen, Xtra Market", 8.757182, -79.866706],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Coronado", "Supermercado Cadena", "Panamá Oeste, Coronado, Mi Feria Xtra", 8.528991, -79.902875],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera", "Supermercado Cadena", "Panamá Oeste, La Chorrera", 8.876628, -79.782775],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera, Maxi Feria Xtra", "Supermercado Cadena", "Panamá Oeste, La Chorrera, Maxi Feria Xtra", 8.878715, -79.779126],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera, Xtra Market", "Supermercado Cadena", "Panamá Oeste, La Chorrera, Xtra Market", 8.877485, -79.778562],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Marquesa", "Supermercado Cadena", "Panamá, La Marquesa", 8.879554, -79.78035],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Llano Largo, Maxi Feria Xtra", "Supermercado Cadena", "Panamá Oeste, La Chorrera, Playa Leona, Calle principal Llano Largo, Maxi Feria Xtra, Dep. Maxi Feria, Urb. Llano Largo", 8.896558, -79.775004],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Vacamonte, Maxi Feria Xtra", "Supermercado Cadena", "Panamá Oeste, Arraiján, Vista Alegre, Vía Puerto Vacamonte, Edf. Vacamonte Plaza, Dep. Maxi Feria Xtra, Urb. La Hacienda", 8.928797, -79.700392],
  ["Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Vista Alegre", "Supermercado Cadena", "Panamá Oeste, Vista Alegre", 8.920049, -79.705857],
  ["Temek, S.A. : Temek, S.A.-El Fuerte 6 - La Onda", "Supermercado Cadena", "Panamá Oeste, Arraiján, Burunga, Calle principal, C.C. Burunga, Planta Baja, Urb. Después de la Delta de Burunga", 8.964609, -79.655106],
  ["Temek, S.A. : Temek, S.A.-Westland Mall", "Supermercado Cadena", "Panamá Oeste, Westland Mall", 8.920797, -79.704578],
  ["Viveros y Legumbres Urriola", "Distribuidora", "Panamá, La Chorrera, Barrio Balboa, Urb. El Marañonal, Mercado de Abastos", 8.876511, -79.781689]
];

for (let i = 0; i < rows.length; i += 25) {
  let sql = '';
  const chunk = rows.slice(i, i + 25);
  for (const row of chunk) {
    const name = row[0].replace(/'/g, "''");
    const rawCat = row[1];
    const cat = mapCategory(rawCat);
    const dir = row[2].replace(/'/g, "''");
    const lat = row[3];
    const lng = row[4];
    const url = URLS[cat] || '';

    sql += `
INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT '${name}', '${cat}', '${dir}', ${lat}, ${lng}, '${url}', '${vendedor_id}', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = '${name}' AND vendedor_id = '${vendedor_id}'
);
`;
  }
  fs.writeFileSync(`scratch/insert_andres_${Math.floor(i/25)}.sql`, sql);
}
