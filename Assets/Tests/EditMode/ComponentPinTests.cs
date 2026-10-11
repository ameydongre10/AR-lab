using NUnit.Framework;
using UnityEngine;
using ARLab.Electronics;
using ARLab.Laboratory;

namespace ARLab.Tests
{
    public class ComponentPinTests
    {
        [Test]
        public void PinSphereColliderRadiusFitsDipPitchWithoutOverlap()
        {
            var ic = ComponentFactory.CreateIc(IcDefinitions.Hex7404);
            try
            {
                var pin1 = ic.Pin(1);
                var pin2 = ic.Pin(2);
                Assert.IsNotNull(pin1);
                Assert.IsNotNull(pin2);

                var col1 = pin1.GetComponent<SphereCollider>();
                var col2 = pin2.GetComponent<SphereCollider>();
                Assert.IsNotNull(col1);
                Assert.IsNotNull(col2);

                // Spacing between pins 1 and 2 is 0.00254m (2.54mm)
                float pinSpacing = Vector3.Distance(pin1.transform.localPosition, pin2.transform.localPosition);
                Assert.AreEqual(0.00254f, pinSpacing, 0.0001f);

                // Radius of collider must be less than half the pin spacing (0.00127m)
                // to prevent adjacent pin colliders from engulfing each other
                Assert.LessOrEqual(col1.radius, pinSpacing * 0.5f);
                Assert.Greater(col1.radius, 0.0005f); // Reasonable touch target scale
            }
            finally
            {
                LabMaterials.Discard(ic.gameObject);
            }
        }
    }
}
