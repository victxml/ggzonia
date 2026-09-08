/**
 * GamerGeekZonia — backend do Fórum usando Google Sheets
 * ------------------------------------------------------
 * COMO USAR:
 * 1. Crie uma planilha nova no Google Sheets.
 * 2. Na primeira linha (cabeçalho), coloque as colunas, nesta ordem:
 *      Nome | Nota | Comentario | Data
 * 3. Nessa planilha, vá em Extensões > Apps Script.
 * 4. Apague o conteúdo padrão do arquivo "Code.gs" e cole TODO o
 *    conteúdo deste arquivo no lugar.
 * 5. Clique em "Implantar" (Deploy) > "Nova implantação".
 *    - Tipo: "App da Web" (Web app)
 *    - Executar como: "Eu" (sua conta)
 *    - Quem pode acessar: "Qualquer pessoa" (Anyone)
 * 6. Autorize as permissões pedidas pelo Google.
 * 7. Copie a URL do "App da Web" que aparece no final.
 * 8. Cole essa URL no index.html, na constante FORUM_API_URL
 *    (procure por "[URL DO GOOGLE APPS SCRIPT]").
 *
 * Pronto: toda avaliação enviada no site vai direto pra essa
 * planilha, e todo mundo que visitar o site vai ver as mesmas
 * avaliações.
 */

var SHEET_NAME = 'Página1'; // troque pelo nome da aba da sua planilha, se for diferente

function getSheet_(){
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

// Lista as avaliações (chamado pelo site via GET)
function doGet(e){
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var rows = values.slice(1); // remove a linha de cabeçalho

  var reviews = rows
    .filter(function(r){ return r[0]; }) // ignora linhas vazias
    .map(function(r){
      return {
        name: r[0],
        rating: r[1],
        comment: r[2],
        date: r[3]
      };
    })
    .reverse(); // mais recentes primeiro

  return ContentService
    .createTextOutput(JSON.stringify(reviews))
    .setMimeType(ContentService.MimeType.JSON);
}

// Recebe uma nova avaliação (chamado pelo site via POST)
function doPost(e){
  var sheet = getSheet_();
  var body = JSON.parse(e.postData.contents);

  var name = (body.name || '').toString().slice(0, 60);
  var rating = Number(body.rating) || 0;
  var comment = (body.comment || '').toString().slice(0, 400);
  var date = new Date().toISOString();

  sheet.appendRow([name, rating, comment, date]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
