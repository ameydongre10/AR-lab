using System;
using System.Collections.Generic;

namespace UnityEngine
{
    public struct Vector2
    {
        public float x, y;
        public Vector2(float x, float y) { this.x = x; this.y = y; }
        public static Vector2 zero => new Vector2(0, 0);
        public static Vector2 one => new Vector2(1, 1);
        public static Vector2 operator +(Vector2 a, Vector2 b) => new Vector2(a.x + b.x, a.y + b.y);
        public static Vector2 operator -(Vector2 a, Vector2 b) => new Vector2(a.x - b.x, a.y - b.y);
        public static Vector2 operator *(Vector2 a, float d) => new Vector2(a.x * d, a.y * d);
        public static float Distance(Vector2 a, Vector2 b) => (float)Math.Sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }

    public struct Vector3
    {
        public float x, y, z;
        public Vector3(float x, float y, float z) { this.x = x; this.y = y; this.z = z; }
        public static Vector3 zero => new Vector3(0, 0, 0);
        public static Vector3 one => new Vector3(1, 1, 1);
        public static Vector3 up => new Vector3(0, 1, 0);
        public static Vector3 down => new Vector3(0, -1, 0);
        public static Vector3 forward => new Vector3(0, 0, 1);
        public static Vector3 back => new Vector3(0, 0, -1);
        public static Vector3 left => new Vector3(-1, 0, 0);
        public static Vector3 right => new Vector3(1, 0, 0);
        public float sqrMagnitude => x * x + y * y + z * z;
        public float magnitude => (float)Math.Sqrt(sqrMagnitude);
        public Vector3 normalized => magnitude > 1e-5f ? this * (1f / magnitude) : zero;
        public static Vector3 operator +(Vector3 a, Vector3 b) => new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
        public static Vector3 operator -(Vector3 a, Vector3 b) => new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
        public static Vector3 operator *(Vector3 a, float d) => new Vector3(a.x * d, a.y * d, a.z * d);
        public static Vector3 operator *(float d, Vector3 a) => a * d;
        public static float Distance(Vector3 a, Vector3 b) => (a - b).magnitude;
        public static float Dot(Vector3 a, Vector3 b) => a.x * b.x + a.y * b.y + a.z * b.z;
        public static Vector3 Cross(Vector3 lhs, Vector3 rhs) =>
            new Vector3(lhs.y * rhs.z - lhs.z * rhs.y, lhs.z * rhs.x - lhs.x * rhs.z, lhs.x * rhs.y - lhs.y * rhs.x);
        public static Vector3 ProjectOnPlane(Vector3 vector, Vector3 planeNormal)
        {
            float num = Dot(planeNormal, planeNormal);
            if (num < 1e-6f) return vector;
            float num2 = Dot(vector, planeNormal);
            return new Vector3(vector.x - planeNormal.x * num2 / num, vector.y - planeNormal.y * num2 / num, vector.z - planeNormal.z * num2 / num);
        }
        public override string ToString() => $"({x:F3}, {y:F3}, {z:F3})";
    }

    public struct Quaternion
    {
        public float x, y, z, w;
        public Quaternion(float x, float y, float z, float w) { this.x = x; this.y = y; this.z = z; this.w = w; }
        public static Quaternion identity => new Quaternion(0, 0, 0, 1);
        public static Quaternion Euler(float x, float y, float z) => new Quaternion(x, y, z, 1);
        public static Quaternion AngleAxis(float angle, Vector3 axis) => new Quaternion(axis.x, axis.y, axis.z, angle);
        public static Quaternion FromToRotation(Vector3 from, Vector3 to) => identity;
        public static Quaternion operator *(Quaternion lhs, Quaternion rhs) => identity;
        public static Vector3 operator *(Quaternion rotation, Vector3 point) => point;
    }

    public struct Color
    {
        public float r, g, b, a;
        public Color(float r, float g, float b, float a = 1f) { this.r = r; this.g = g; this.b = b; this.a = a; }
        public static Color white => new Color(1, 1, 1, 1);
        public static Color black => new Color(0, 0, 0, 1);
        public static Color red => new Color(1, 0, 0, 1);
        public static Color green => new Color(0, 1, 0, 1);
        public static Color blue => new Color(0, 0, 1, 1);
        public static Color HSVToRGB(float h, float s, float v) => new Color(v, v, v, 1);
        public static Color operator *(Color c, float f) => new Color(c.r * f, c.g * f, c.b * f, c.a * f);
        public static Color operator *(float f, Color c) => c * f;
        public static implicit operator Color32(Color c) => new Color32((byte)(c.r * 255), (byte)(c.g * 255), (byte)(c.b * 255), (byte)(c.a * 255));
    }

    public struct Color32
    {
        public byte r, g, b, a;
        public Color32(byte r, byte g, byte b, byte a) { this.r = r; this.g = g; this.b = b; this.a = a; }
        public static implicit operator Color(Color32 c) => new Color(c.r / 255f, c.g / 255f, c.b / 255f, c.a / 255f);
    }

    public enum TextureFormat { RGBA32 }
    public enum TextureWrapMode { Clamp, Repeat }

    public class Texture2D : Object
    {
        public TextureWrapMode wrapMode { get; set; }
        public Texture2D(int w, int h, TextureFormat format, bool mipChain) { }
        public void SetPixels32(Color32[] colors) { }
        public void Apply(bool updateMipmaps = true, bool makeNoLongerReadable = false) { }
    }

    public static class Mathf
    {
        public const float PI = (float)Math.PI;
        public const float Rad2Deg = 57.29578f;
        public const float Deg2Rad = 0.017453292f;
        public static float Abs(float f) => Math.Abs(f);
        public static int Abs(int f) => Math.Abs(f);
        public static float Min(float a, float b) => Math.Min(a, b);
        public static int Min(int a, int b) => Math.Min(a, b);
        public static float Max(float a, float b) => Math.Max(a, b);
        public static int Max(int a, int b) => Math.Max(a, b);
        public static float Clamp(float v, float min, float max) => v < min ? min : (v > max ? max : v);
        public static int Clamp(int v, int min, int max) => v < min ? min : (v > max ? max : v);
        public static float Clamp01(float v) => Clamp(v, 0f, 1f);
        public static int RoundToInt(float f) => (int)Math.Round(f, MidpointRounding.AwayFromZero);
        public static float Cos(float f) => (float)Math.Cos(f);
        public static float Sin(float f) => (float)Math.Sin(f);
        public static float Atan2(float y, float x) => (float)Math.Atan2(y, x);
        public static float DeltaAngle(float current, float target) => (target - current);
        public static float Exp(float power) => (float)Math.Exp(power);
    }

    public class Object
    {
        public string name { get; set; } = string.Empty;
        public static void Destroy(Object obj) { }
        public static void DestroyImmediate(Object obj) { }
    }

    public class Component : Object
    {
        public GameObject gameObject { get; internal set; }
        public Transform transform => gameObject.transform;
        public T GetComponent<T>() where T : Component => gameObject.GetComponent<T>();
        public T GetComponentInChildren<T>(bool includeInactive = false) where T : Component => gameObject.GetComponentInChildren<T>(includeInactive);
        public T[] GetComponentsInChildren<T>(bool includeInactive = false) where T : class => gameObject.GetComponentsInChildren<T>(includeInactive);
        public T GetComponentInParent<T>() where T : Component => gameObject.GetComponentInParent<T>();
        public T AddComponent<T>() where T : Component => gameObject.AddComponent<T>();
    }

    public class Transform : Component
    {
        public Vector3 position { get; set; } = Vector3.zero;
        public Vector3 localPosition { get; set; } = Vector3.zero;
        public Quaternion rotation { get; set; } = Quaternion.identity;
        public Quaternion localRotation { get; set; } = Quaternion.identity;
        public Vector3 localScale { get; set; } = Vector3.one;
        public Vector3 eulerAngles { get; set; } = Vector3.zero;
        public Vector3 forward => Vector3.forward;
        public Vector3 up => Vector3.up;
        public Transform parent { get; set; }
        public int childCount => 0;
        public void SetParent(Transform p, bool worldPositionStays = true) { parent = p; }
        public Vector3 InverseTransformPoint(Vector3 p) => p - position;
        public Vector3 TransformPoint(Vector3 p) => position + p;
        public Transform Find(string n) => null;
        public Transform GetChild(int index) => this;
    }

    public class GameObject : Object
    {
        private readonly List<Component> _components = new List<Component>();
        public Transform transform { get; }
        public bool activeSelf { get; set; } = true;
        public string tag { get; set; } = "Untagged";

        public GameObject(string name, params Type[] components)
        {
            this.name = name;
            transform = new Transform { gameObject = this };
            _components.Add(transform);
            foreach (var t in components)
            {
                var c = (Component)Activator.CreateInstance(t);
                c.gameObject = this;
                _components.Add(c);
            }
        }

        public GameObject() : this("New Game Object") { }

        public T AddComponent<T>() where T : Component
        {
            var c = Activator.CreateInstance<T>();
            c.gameObject = this;
            _components.Add(c);
            return c;
        }

        public T GetComponent<T>() where T : class
        {
            for (int i = 0; i < _components.Count; i++) if (_components[i] is T match) return match;
            return null;
        }

        public T GetComponentInChildren<T>(bool includeInactive = false) where T : class => GetComponent<T>();
        public T[] GetComponentsInChildren<T>(bool includeInactive = false) where T : class
        {
            var list = new List<T>();
            for (int i = 0; i < _components.Count; i++) if (_components[i] is T match) list.Add(match);
            return list.ToArray();
        }
        public T GetComponentInParent<T>() where T : class => GetComponent<T>();
        public void SetActive(bool active) => activeSelf = active;
        public static GameObject CreatePrimitive(PrimitiveType type) => new GameObject(type.ToString());
    }

    public enum PrimitiveType { Sphere, Cube, Cylinder, Quad }

    public class MonoBehaviour : Component { }

    public class Collider : Component
    {
        public bool isTrigger { get; set; }
    }

    public class BoxCollider : Collider
    {
        public Vector3 size { get; set; } = Vector3.one;
        public Vector3 center { get; set; } = Vector3.zero;
    }

    public class SphereCollider : Collider
    {
        public float radius { get; set; } = 0.5f;
    }

    public class Renderer : Component
    {
        public bool enabled { get; set; } = true;
        public Material sharedMaterial { get; set; }
        public Material material { get; set; }
        public void GetPropertyBlock(MaterialPropertyBlock mpb) { }
        public void SetPropertyBlock(MaterialPropertyBlock mpb) { }
    }

    public class MeshRenderer : Renderer
    {
        public UnityEngine.Rendering.ShadowCastingMode shadowCastingMode { get; set; }
        public bool receiveShadows { get; set; }
    }

    public class MeshFilter : Component
    {
        public Mesh sharedMesh { get; set; }
        public Mesh mesh { get; set; }
    }

    public class Mesh : Object
    {
        public Vector3[] vertices { get; set; } = Array.Empty<Vector3>();
        public int[] triangles { get; set; } = Array.Empty<int>();
        public void RecalculateBounds() { }
        public void SetVertices(List<Vector3> verts) { }
        public void SetNormals(List<Vector3> normals) { }
        public void SetColors(List<Color> colors) { }
        public void SetTriangles(List<int> tris, int submesh) { }
    }

    public class Material : Object
    {
        public Color color { get; set; } = Color.white;
        public Texture2D mainTexture { get; set; }
        public Material(Shader s) { }
        public Material(Material m) { }
        public bool HasProperty(string n) => true;
        public bool HasProperty(int id) => true;
        public void SetColor(string n, Color c) { }
        public void SetColor(int id, Color c) { }
        public void SetFloat(string n, float f) { }
        public void SetFloat(int id, float f) { }
        public void EnableKeyword(string k) { }
        public void DisableKeyword(string k) { }
        public int renderQueue { get; set; }
    }

    public class Shader : Object
    {
        public static Shader Find(string n) => new Shader { name = n };
        public static int PropertyToID(string name) => name.GetHashCode();
    }

    public class MaterialPropertyBlock
    {
        public void SetColor(string n, Color c) { }
        public void SetFloat(string n, float f) { }
        public void SetColor(int id, Color c) { }
        public void SetFloat(int id, float f) { }
    }

    public enum TextAnchor { LowerLeft, LowerCenter, LowerRight, MiddleLeft, MiddleCenter, MiddleRight, UpperLeft, UpperCenter, UpperRight }
    public enum TextAlignment { Left, Center, Right }

    public class TextMesh : Component
    {
        public string text { get; set; } = string.Empty;
        public Color color { get; set; } = Color.white;
        public int fontSize { get; set; } = 14;
        public float characterSize { get; set; } = 1f;
        public TextAnchor anchor { get; set; } = TextAnchor.UpperLeft;
        public TextAlignment alignment { get; set; } = TextAlignment.Left;
    }

    public static class Debug
    {
        public static void Log(object msg) { }
        public static void LogWarning(object msg) { }
        public static void LogError(object msg) { }
    }

    public static class Time
    {
        public static float deltaTime => 0.016f;
        public static float realtimeSinceStartup => 1.0f;
    }

    public static class Application
    {
        public static bool isPlaying => true;
        public static bool isEditor => true;
    }

    public class SerializeField : Attribute { }
    public class HideInInspector : Attribute { }
    public class DisallowMultipleComponent : Attribute { }
    public class RequireComponent : Attribute { public RequireComponent(Type t) { } }
    public class Header : Attribute { public Header(string h) { } }
    public class RangeAttribute : Attribute { public RangeAttribute(float min, float max) { } }
    public class TextAreaAttribute : Attribute { public TextAreaAttribute(int minLines = 3, int maxLines = 6) { } }

    namespace Rendering
    {
        public enum ShadowCastingMode { Off, On }
        public enum BlendMode { SrcAlpha, OneMinusSrcAlpha }
        public enum CullMode { Off, Front, Back }
        public enum RenderQueue { Transparent = 3000 }
    }
}
