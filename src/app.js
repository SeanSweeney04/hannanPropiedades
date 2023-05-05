// const express = require('express');
// const request = require('request');
// const app = express();

// app.set('view engine', 'ejs');


// app.get('/', (req, res) => {
//   const url = 'https://witei.com/api/v1/houses/';
//   const headers = {'Authorization': 'Bearer 7a54f9633cf443d988c0c49e2b77989b'};

//   request({url, headers}, (error, response, body) => {
//     if (error) {
//       res.status(500).send('Error interno del servidor');
//     } else {
//       const data = JSON.parse(body);
//       const propiedades_disponibles = data.results.filter(prop => prop.status === 'disponible');
//       res.render('propiedades', {propiedades: propiedades_disponibles});
//     }
//   });
// });

// app.get('/propiedad/:prop_id', (req, res) => {
//     const prop_id = req.params.prop_id;
//     const url = `https://witei.com/api/v1/houses/?identifier=${prop_id}`;
//     const headers = {'Authorization': 'Bearer 7a54f9633cf443d988c0c49e2b77989b'};
  
//     request({url, headers}, (error, response, body) => {
//       if (error) {
//         res.status(500).send('Error interno del servidor');
//       } else {
//         const data = JSON.parse(body);
//         if (data.count > 0 && data.results[0].identifier === prop_id) {
//           res.render('propiedad_detalle', {detalle: data.results});
//         } else {
//           res.status(404).send('Propiedad no encontrada o no disponible');
//         }
//       }
//     });
//   });
// app.listen(5000, () => {
//   console.log('La aplicación está funcionando en el puerto 5000');
// });

const express = require('express');
const request = require('request');
const async = require('async');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const headers = {'Authorization': 'Bearer 7a54f9633cf443d988c0c49e2b77989b'};
  const propiedades_disponibles = [];

  async.timesSeries(5, (pageNumber, next) => {
    const url = `https://witei.com/api/v1/houses/?page=${pageNumber+1}&status=available`;
    request({url, headers}, (error, response, body) => {
      if (error) {
        next(error);
      } else {
        const data = JSON.parse(body);
        console.log(data); // Verificar el contenido de data
        if (data.results) {
          propiedades_disponibles.push(...data.results);
        } else {
          console.log('No se encontraron resultados en la página', pageNumber+1);
        }
        next();
      }
    });
  }, (error) => {
    if (error) {
      res.status(500).send('Error interno del servidor');
    } else {
      res.render('propiedades', {propiedades: propiedades_disponibles});
    }
  });
});

app.get('/propiedad/:prop_id', (req, res) => {
  const prop_id = req.params.prop_id;
  const url = `https://witei.com/api/v1/houses/?identifier=${prop_id}`;
  const headers = {'Authorization': 'Bearer 7a54f9633cf443d988c0c49e2b77989b'};

  request({url, headers}, (error, response, body) => {
    if (error) {
      res.status(500).send('Error interno del servidor');
    } else {
      const data = JSON.parse(body);
      if (data.count > 0 && data.results[0].identifier === prop_id) {
        res.render('propiedad_detalle', {detalle: data.results});
      } else {
        res.status(404).send('Propiedad no encontrada o no disponible');
      }
    }
  });
});

app.listen(port, () => {
  console.log('La aplicación está funcionando en el puerto '+ port);
});