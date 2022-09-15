function init() {
  const popup = document.querySelector(".popup");
  let popUp = "";
  let iller, ilceler;

  const $ = go.GraphObject.make; // for conciseness in defining templates

  myDiagram = $(go.Diagram, "myDiagramDiv", {
    allowMove: false,
    allowCopy: false,
    allowDelete: false,
    allowHorizontalScroll: false,
    layout: $(go.TreeLayout, {
      alignment: go.TreeLayout.AlignmentStart,
      angle: 0,
      compaction: go.TreeLayout.CompactionNone,
      layerSpacing: 16,
      layerSpacingParentOverlap: 1,
      nodeIndentPastParent: 1.0,
      nodeSpacing: 0,
      setsPortSpot: false,
      setsChildPortSpot: false,
    }),
  });

  fetch("./turkiye.json")
    .then((response) => response.json())
    .then((data) => {
      iller = { ...data.data };
      ilceler = { ...data.data[0].ilceler };
      //console.log(iller,ilceler);

      myDiagram.nodeTemplate = $(
        go.Node,
        {
          // no Adornment: instead change panel background color by binding to Node.isSelected
          selectionAdorned: false,
          // a custom function to allow expanding/collapsing on double-click
          // this uses similar logic to a TreeExpanderButton
          doubleClick: (e, node) => {
            var cmd = myDiagram.commandHandler;
            if (node.isTreeExpanded) {
              if (!cmd.canCollapseTree(node)) return;
            } else {
              if (!cmd.canExpandTree(node)) return;
            }
            e.handled = true;
            if (node.isTreeExpanded) {
              cmd.collapseTree(node);
            } else {
              cmd.expandTree(node);
            }
          },
        },
        $("TreeExpanderButton", {
          // customize the button's appearance
          _treeExpandedFigure: "LineDown",
          _treeCollapsedFigure: "LineRight",
          "ButtonBorder.fill": "whitesmoke",
          "ButtonBorder.stroke": null,
          _buttonFillOver: "rgba(0,128,255,0.25)",
          _buttonStrokeOver: null,
        }),
        $(
          go.Panel,
          "Horizontal",
          { position: new go.Point(18, 4) },
          new go.Binding("background", "isSelected", (s) =>
            s ? "lightblue" : "white"
          ).ofObject(),
          $(
            go.Picture,
            {
              width: 18,
              height: 18,
              margin: new go.Margin(0, 4, 0, 0),
              imageStretch: go.GraphObject.Uniform,
            },
            // bind the picture source on two properties of the Node
            // to display open folder, closed folder, or document
            new go.Binding(
              "source",
              "isTreeExpanded",
              imageConverter
            ).ofObject(),
            new go.Binding("source", "isTreeLeaf", imageConverter).ofObject()
          ),
          $(
            go.TextBlock,
            { font: "9pt Verdana, sans-serif" },
            new go.Binding("text", "key", (s) => {
              return iller[s].il_adi;
            })
          )
        ) // end Horizontal Panel
      ); // end Node
    });

  function showMessage(s) {
    const chosenCity = Object.entries(iller)[s.key][1];
    popUp = `
        <div class="text">
          <h2>${chosenCity.il_adi}</h2>
          <table>
            <tr>
              <td>Plaka Kodu: </td>
              <td>${chosenCity.plaka_kodu}</td>
            </tr>
            <tr>
              <td>Bulunduğu Bölge: </td>
              <td>${chosenCity.bolge}</td>
            </tr>
            <tr>
              <td>Nüfus: </td>
              <td>${chosenCity.nufus}</td>
            </tr>
          </table>
        </div>
        <i class="fas fa-thin fa-xmark"></i>
      `;

    popup.classList.remove("unvisible");
    setTimeout(() => {
      popup.classList.add("unvisible");
    }, 5 * 1000);

    popup.innerHTML = popUp;
  }

  // without lines
  myDiagram.linkTemplate = $(go.Link);

  // create a random tree
  var nodeDataArray = [{ key: 0 }];
  var max = 80;
  var count = 0;
  while (count < max) {
    count = makeTree(0, count, max, nodeDataArray, nodeDataArray[0]);
  }

  myDiagram.model = new go.TreeModel(nodeDataArray);

  myDiagram.addDiagramListener("ObjectSingleClicked", function (e) {
    var part = e.subject.part;
    if (!(part instanceof go.Link)) showMessage(part);
  });
}

function makeTree(level, count, max, nodeDataArray, parentdata) {
  var numchildren = 5;
  for (var i = 0; i < numchildren; i++) {
    if (count >= max) return count;
    count++;
    var childdata = { key: count, parent: parentdata.key };
    nodeDataArray.push(childdata);
    if (level > 0 && Math.random() > 0.5) {
      count = makeTree(level - 1, count, max, nodeDataArray, childdata);
    }
  }
  return count;
}

// takes a property change on either isTreeLeaf or isTreeExpanded and selects the correct image to use
function imageConverter(prop, picture) {
  var node = picture.part;
  if (node.isTreeLeaf) {
    return;
  } else {
    if (node.isTreeExpanded) {
      return;
    } else {
      return;
    }
  }
}
window.addEventListener("DOMContentLoaded", init);
