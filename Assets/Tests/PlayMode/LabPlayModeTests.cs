using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using ARLab.AR;
using ARLab.Core;
using ARLab.Electronics;
using ARLab.Laboratory;
using ARLab.Simulation;

namespace ARLab.Tests.PlayMode
{
    public class LabPlayModeTests
    {
        private GameObject _holder;

        [UnitySetUp]
        public IEnumerator SetUp()
        {
            _holder = new GameObject("TestHolder");
            yield return null;
        }

        [UnityTearDown]
        public IEnumerator TearDown()
        {
            if (_holder != null) Object.Destroy(_holder);
            yield return null;
        }

        [UnityTest]
        public IEnumerator BreadboardInstantiatesAndInitializesDeck()
        {
            var go = new GameObject("Breadboard");
            go.transform.SetParent(_holder.transform);
            var bb = go.AddComponent<Breadboard>();
            bb.Configure(30, false);

            yield return null;

            Assert.IsNotNull(bb.Grid);
            Assert.AreEqual(30, bb.Columns);

            Transform deck = bb.transform.Find("Deck");
            Assert.IsNotNull(deck, "Breadboard must build a Deck child in play mode");

            var col = bb.GetComponent<BoxCollider>();
            Assert.IsNotNull(col);
            Assert.IsTrue(col.isTrigger);
        }

        [UnityTest]
        public IEnumerator LaboratoryManagerSpawnsAndSeatsIcComponent()
        {
            var labGo = new GameObject("LabManager");
            labGo.transform.SetParent(_holder.transform);
            var lab = labGo.AddComponent<LaboratoryManager>();

            var boardGo = new GameObject("Breadboard");
            boardGo.transform.SetParent(_holder.transform);
            var bb = boardGo.AddComponent<Breadboard>();
            bb.Configure(63, false);

            lab.Configure(labGo.transform, bb, null, labGo.transform);

            yield return null;

            var ic = lab.Spawn("7404", Vector3.zero) as IcComponent;
            Assert.IsNotNull(ic);
            Assert.AreEqual("Hex7404", ic.Definition.Name);

            // Verify IC is seated onto breadboard
            int sockTerm = bb.Grid.TerminalAt(10, BreadboardRow.F);
            ComponentPin p1 = ic.Pin(1);
            Assert.IsNotNull(p1);
            Assert.IsTrue(lab.Graph.AreDirectlyConnected(p1.TerminalId, sockTerm), "IC pin 1 must be tied to column 10 Row F");

            // Verify clean removal
            lab.Remove(ic);
            yield return null;
            Assert.AreEqual(0, lab.Components.Count);
        }

        [UnityTest]
        public IEnumerator WireConnectsAndDisconnectsCleanly()
        {
            var labGo = new GameObject("LabManager");
            labGo.transform.SetParent(_holder.transform);
            var lab = labGo.AddComponent<LaboratoryManager>();

            var boardGo = new GameObject("Breadboard");
            boardGo.transform.SetParent(_holder.transform);
            var bb = boardGo.AddComponent<Breadboard>();
            bb.Configure(30, false);
            bb.Register(lab.Graph);

            lab.Configure(labGo.transform, bb, null, labGo.transform);
            yield return null;

            var swA = lab.Spawn("SW", Vector3.zero) as InputSwitch;
            var led = lab.Spawn("LED", new Vector3(0.1f, 0, 0)) as LedIndicator;

            Assert.IsNotNull(swA);
            Assert.IsNotNull(led);

            ComponentPin outPin = swA.Pin(1);
            ComponentPin inPin = led.Pin(1);

            Assert.IsTrue(lab.BeginWire(outPin));
            Assert.IsTrue(lab.CompleteWire(inPin));
            Assert.AreEqual(1, lab.WireCount);
            Assert.IsTrue(lab.Graph.AreDirectlyConnected(outPin.TerminalId, inPin.TerminalId));

            lab.ClearWires();
            Assert.AreEqual(0, lab.WireCount);
            Assert.IsFalse(lab.Graph.AreDirectlyConnected(outPin.TerminalId, inPin.TerminalId));
        }

        [UnityTest]
        public IEnumerator PlacementManagerPlacesAndClampsWithoutUnexpectedTilt()
        {
            var root = new GameObject("LabRoot");
            root.transform.SetParent(_holder.transform);

            var pmGo = new GameObject("PlacementManager");
            pmGo.transform.SetParent(_holder.transform);
            var pm = pmGo.AddComponent<ARPlacementManager>();

            var stateMachine = new ArStateMachine();
            pm.Attach(stateMachine);
            pm.Configure(null, null, root.transform, null);

            // Test placing at flat horizontal surface
            Pose surfacePose = new Pose(new Vector3(0f, 0f, 1f), Quaternion.identity);
            bool placed = pm.TryPlaceAt(surfacePose);

            yield return null;

            Assert.IsTrue(placed);
            Assert.IsTrue(pm.IsPlaced);
            Assert.AreEqual(Vector3.zero, root.transform.eulerAngles, "Flat horizontal placement must have zero pitch tilt");
        }
    }
}
