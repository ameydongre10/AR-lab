using NUnit.Framework;
using UnityEngine;
using ARLab.Electronics;
using ARLab.Laboratory;

namespace ARLab.Tests
{
    public class BreadboardGeometryTests
    {
        [Test]
        public void TrySocketAtLocalRecognizes3DCoordinatesAlongZ()
        {
            var grid = new BreadboardGrid(63);

            // In 3D space on the breadboard, X is column and Z is row (Y is height above board ~ 0.002m)
            float col5X = BreadboardGrid.ColumnX(5);
            float rowCZ = BreadboardGrid.RowY(BreadboardRow.C);
            Vector3 hitPoint3D = new Vector3(col5X, 0.002f, rowCZ);

            Assert.IsTrue(grid.TrySocketAtLocal(hitPoint3D, out int col, out BreadboardRow row));
            Assert.AreEqual(5, col);
            Assert.AreEqual(BreadboardRow.C, row);

            // Test lower half across trench (Row H)
            float rowHZ = BreadboardGrid.RowY(BreadboardRow.H);
            Vector3 hitPoint3DLower = new Vector3(col5X, 0.002f, rowHZ);
            Assert.IsTrue(grid.TrySocketAtLocal(hitPoint3DLower, out int colLow, out BreadboardRow rowLow));
            Assert.AreEqual(5, colLow);
            Assert.AreEqual(BreadboardRow.H, rowLow);
        }

        [Test]
        public void TrySocketAtLocalMaintainsBackwardCompatibilityWith2DCoordinates()
        {
            var grid = new BreadboardGrid(63);

            // In 2D space, X is column and Y is row (Z is 0)
            float col10X = BreadboardGrid.ColumnX(10);
            float rowDY = BreadboardGrid.RowY(BreadboardRow.D);
            Vector3 hitPoint2D = new Vector3(col10X, rowDY, 0f);

            Assert.IsTrue(grid.TrySocketAtLocal(hitPoint2D, out int col, out BreadboardRow row));
            Assert.AreEqual(10, col);
            Assert.AreEqual(BreadboardRow.D, row);
        }

        [Test]
        public void RemoveTiesByRefRemovesOnlyTargetedTies()
        {
            var graph = new ConnectionGraph();
            int t1 = graph.AddTerminal(TerminalKind.ComponentPin, "Pin1", null);
            int t2 = graph.AddTerminal(TerminalKind.BreadboardSocket, "Sock1", null);
            int t3 = graph.AddTerminal(TerminalKind.ComponentPin, "Pin2", null);
            int t4 = graph.AddTerminal(TerminalKind.BreadboardSocket, "Sock2", null);

            object chipA = new object();
            object chipB = new object();

            graph.AddTie(t1, t2, ConnectionKind.BreadboardTie, chipA);
            graph.AddTie(t3, t4, ConnectionKind.BreadboardTie, chipB);

            Assert.IsTrue(graph.AreDirectlyConnected(t1, t2));
            Assert.IsTrue(graph.AreDirectlyConnected(t3, t4));

            int removed = graph.RemoveTiesByRef(chipA);
            Assert.AreEqual(1, removed);

            Assert.IsFalse(graph.AreDirectlyConnected(t1, t2));
            Assert.IsTrue(graph.AreDirectlyConnected(t3, t4));
        }
    }
}
