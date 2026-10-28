"""
DiffBeacon Multi-Language Parser and Capability Registry
Provides modular parser adapters and analysis capability tracking across Tier 1 and Tier 2 languages.
"""

from typing import Dict, List, Any, Optional, Set
import re
import os
from .parser import ParsedSymbol, ParsedCall


class LanguageCapability:
    FILE_DISCOVERY = "file_discovery"
    AST_PARSING = "ast_parsing"
    SYMBOL_EXTRACTION = "symbol_extraction"
    IMPORTS_EXTRACTION = "imports_extraction"
    CALL_GRAPH = "call_graph"
    CONTRACT_ANALYSIS = "contract_analysis"
    FRAMEWORK_RULES = "framework_rules"
    TEST_DISCOVERY = "test_discovery"


class LanguageDefinition:
    def __init__(
        self,
        key: str,
        name: str,
        tier: int,
        extensions: List[str],
        capabilities: List[str],
        parser_engine: str,
        description: str,
        supported_frameworks: Optional[List[str]] = None,
        known_limitations: Optional[List[str]] = None,
    ):
        self.key = key
        self.name = name
        self.tier = tier
        self.extensions = extensions
        self.capabilities = capabilities
        self.parser_engine = parser_engine
        self.description = description
        self.supported_frameworks = supported_frameworks or []
        self.known_limitations = known_limitations or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "key": self.key,
            "name": self.name,
            "tier": self.tier,
            "extensions": self.extensions,
            "capabilities": self.capabilities,
            "parser_engine": self.parser_engine,
            "description": self.description,
            "supported_frameworks": self.supported_frameworks,
            "known_limitations": self.known_limitations,
            "is_tier_1": self.tier == 1,
        }


# Global Registry of Languages and Capabilities
LANGUAGE_DEFINITIONS: Dict[str, LanguageDefinition] = {
    # Tier 1 - Core & Advanced Static Analysis
    "python": LanguageDefinition(
        key="python",
        name="Python",
        tier=1,
        extensions=[".py", ".pyw", ".pyi"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.CONTRACT_ANALYSIS,
            LanguageCapability.FRAMEWORK_RULES,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="Python AST (Standard Library `ast`)",
        description="Comprehensive AST parsing with Django/DRF semantic adapters, call-graph construction, and pytest discovery.",
        supported_frameworks=["Django 5.x", "Django REST Framework", "FastAPI", "pytest"],
        known_limitations=[
            "Dynamic imports (importlib.import_module)",
            "Runtime getattr/setattr dispatch",
            "Metaclass attribute generation",
        ],
    ),
    "typescript": LanguageDefinition(
        key="typescript",
        name="TypeScript",
        tier=1,
        extensions=[".ts", ".tsx", ".mts"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.CONTRACT_ANALYSIS,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="Structural Tokenizer & Regex AST Adapter",
        description="Type-aware symbol indexing, interface contracts, React component boundaries, and Vitest/Jest suite discovery.",
        supported_frameworks=["React", "Express", "Next.js", "Vitest", "Jest"],
        known_limitations=[
            "Complex higher-order component type inference",
            "Dynamic type assertion (`any` casts)",
        ],
    ),
    "javascript": LanguageDefinition(
        key="javascript",
        name="JavaScript",
        tier=1,
        extensions=[".js", ".jsx", ".mjs", ".cjs"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="Structural Tokenizer & ES Module Adapter",
        description="ES6+ class and function extraction, CommonJS/ESM import tracing, and endpoint handler routing.",
        supported_frameworks=["Node.js", "React", "Express", "Mocha"],
        known_limitations=["Prototypal monkeypatching", "Dynamic require() calls"],
    ),
    "go": LanguageDefinition(
        key="go",
        name="Go",
        tier=1,
        extensions=[".go"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.CONTRACT_ANALYSIS,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="Go Struct & Function Lexer",
        description="Struct definition diffing, exported package methods, interface implementations, and go test extraction.",
        supported_frameworks=["Gin", "Echo", "Standard Library `net/http`", "testing"],
        known_limitations=["Interface reflection (`reflect.ValueOf`)", "Unbuffered channel timing"],
    ),
    "java": LanguageDefinition(
        key="java",
        name="Java",
        tier=1,
        extensions=[".java"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.CONTRACT_ANALYSIS,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="Java Class & Annotation Lexer",
        description="Spring Boot controller annotations, class inheritance hierarchies, and JUnit test matching.",
        supported_frameworks=["Spring Boot", "JUnit 5", "Jakarta EE"],
        known_limitations=["Dynamic byte-code manipulation", "Reflection (java.lang.reflect)"],
    ),
    "rust": LanguageDefinition(
        key="rust",
        name="Rust",
        tier=1,
        extensions=[".rs"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.CONTRACT_ANALYSIS,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="Rust Item & Trait Tokenizer",
        description="Structs, enums, trait impl blocks, public functions, and #[test] harness indexing.",
        supported_frameworks=["Actix-web", "Axum", "Tokio", "cargo test"],
        known_limitations=["Procedural macros with custom AST rewrites", "Unsafe pointer arithmetic"],
    ),
    "csharp": LanguageDefinition(
        key="csharp",
        name="C# / .NET",
        tier=1,
        extensions=[".cs"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="C# Roslyn Structural Lexer",
        description="ASP.NET Core controllers, record types, interface declarations, and xUnit discovery.",
        supported_frameworks=["ASP.NET Core", "Entity Framework", "xUnit"],
        known_limitations=["Reflection dispatch (`Activator.CreateInstance`)", "Dynamic keywords"],
    ),
    "cpp": LanguageDefinition(
        key="cpp",
        name="C++",
        tier=1,
        extensions=[".cpp", ".cc", ".cxx", ".hpp", ".h"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
        ],
        parser_engine="C/C++ Header & Class Tokenizer",
        description="Namespaces, class templates, method signatures, and #include dependency mapping.",
        supported_frameworks=["Google Test", "Boost", "Qt"],
        known_limitations=["Complex macro expansion preprocessor tricks", "Template metaprogramming"],
    ),
    "c": LanguageDefinition(
        key="c",
        name="C",
        tier=1,
        extensions=[".c", ".h"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
        ],
        parser_engine="C Structural Function Scanner",
        description="Function prototypes, struct definitions, enum constants, and header dependencies.",
        supported_frameworks=["Unity", "CMock"],
        known_limitations=["Macro-defined function implementations", "Function pointer tables"],
    ),
    "php": LanguageDefinition(
        key="php",
        name="PHP",
        tier=1,
        extensions=[".php", ".phtml"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="PHP Class & Route Tokenizer",
        description="Laravel routes, class methods, traits, namespaces, and PHPUnit discovery.",
        supported_frameworks=["Laravel", "Symfony", "PHPUnit"],
        known_limitations=["Magic methods (__call, __get)", "Variable variable names ($$var)"],
    ),
    "ruby": LanguageDefinition(
        key="ruby",
        name="Ruby",
        tier=1,
        extensions=[".rb", ".rake"],
        capabilities=[
            LanguageCapability.FILE_DISCOVERY,
            LanguageCapability.AST_PARSING,
            LanguageCapability.SYMBOL_EXTRACTION,
            LanguageCapability.IMPORTS_EXTRACTION,
            LanguageCapability.CALL_GRAPH,
            LanguageCapability.TEST_DISCOVERY,
        ],
        parser_engine="Ruby Class & Method Scanner",
        description="Rails models, controllers, modules, and RSpec/Minitest discovery.",
        supported_frameworks=["Ruby on Rails", "RSpec", "Minitest"],
        known_limitations=["Metaprogramming (define_method, method_missing)", "Monkeypatching core classes"],
    ),

    # Tier 2 - Supported via Structural & Semantic Adapters
    "kotlin": LanguageDefinition(
        key="kotlin",
        name="Kotlin",
        tier=2,
        extensions=[".kt", ".kts"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION, LanguageCapability.IMPORTS_EXTRACTION],
        parser_engine="Kotlin Class Lexer",
        description="Data classes, functions, companion objects, and package imports.",
    ),
    "swift": LanguageDefinition(
        key="swift",
        name="Swift",
        tier=2,
        extensions=[".swift"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION, LanguageCapability.IMPORTS_EXTRACTION],
        parser_engine="Swift Protocol & Struct Lexer",
        description="Protocols, structs, classes, and import declarations.",
    ),
    "scala": LanguageDefinition(
        key="scala",
        name="Scala",
        tier=2,
        extensions=[".scala", ".sc"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION, LanguageCapability.IMPORTS_EXTRACTION],
        parser_engine="Scala Object Lexer",
        description="Traits, case classes, and package objects.",
    ),
    "dart": LanguageDefinition(
        key="dart",
        name="Dart / Flutter",
        tier=2,
        extensions=[".dart"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION, LanguageCapability.IMPORTS_EXTRACTION],
        parser_engine="Dart Widget & Class Lexer",
        description="Flutter widgets, stateful classes, and library imports.",
    ),
    "lua": LanguageDefinition(
        key="lua",
        name="Lua",
        tier=2,
        extensions=[".lua"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION],
        parser_engine="Lua Function Tokenizer",
        description="Table definitions and global/local functions.",
    ),
    "r": LanguageDefinition(
        key="r",
        name="R",
        tier=2,
        extensions=[".r", ".R"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION],
        parser_engine="R Script Scanner",
        description="Function assignments and library loads.",
    ),
    "shell": LanguageDefinition(
        key="shell",
        name="Bash / Shell",
        tier=2,
        extensions=[".sh", ".bash", ".zsh"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION],
        parser_engine="Shell Function Scanner",
        description="Function definitions and exported environment variables.",
    ),
    "sql": LanguageDefinition(
        key="sql",
        name="SQL / DDL",
        tier=2,
        extensions=[".sql"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION, LanguageCapability.CONTRACT_ANALYSIS],
        parser_engine="SQL DDL Statement Parser",
        description="CREATE TABLE, ALTER TABLE, indexes, and schema definitions.",
    ),
    "json": LanguageDefinition(
        key="json",
        name="JSON",
        tier=2,
        extensions=[".json"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.CONTRACT_ANALYSIS],
        parser_engine="JSON Object Structural Diff Engine",
        description="Configuration schema differences and API payload contracts.",
    ),
    "yaml": LanguageDefinition(
        key="yaml",
        name="YAML / OpenAPI",
        tier=2,
        extensions=[".yaml", ".yml"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.CONTRACT_ANALYSIS],
        parser_engine="YAML Schema & OpenAPI Specification Parser",
        description="OpenAPI/Swagger specs, CI workflows, and Kubernetes manifests.",
    ),
    "toml": LanguageDefinition(
        key="toml",
        name="TOML",
        tier=2,
        extensions=[".toml"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.CONTRACT_ANALYSIS],
        parser_engine="TOML Config Lexer",
        description="Cargo.toml and pyproject.toml package dependency shifts.",
    ),
    "xml": LanguageDefinition(
        key="xml",
        name="XML",
        tier=2,
        extensions=[".xml"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.CONTRACT_ANALYSIS],
        parser_engine="XML Node Tree Parser",
        description="pom.xml and configuration schemas.",
    ),
    "markdown": LanguageDefinition(
        key="markdown",
        name="Markdown",
        tier=2,
        extensions=[".md", ".mdx"],
        capabilities=[LanguageCapability.FILE_DISCOVERY],
        parser_engine="Markdown Heading & Section Parser",
        description="Documentation sections and API changelogs.",
    ),
    "graphql": LanguageDefinition(
        key="graphql",
        name="GraphQL",
        tier=2,
        extensions=[".graphql", ".gql"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION, LanguageCapability.CONTRACT_ANALYSIS],
        parser_engine="GraphQL Schema AST Parser",
        description="Query, Mutation, and Type definition schema diffing.",
    ),
    "protobuf": LanguageDefinition(
        key="protobuf",
        name="Protocol Buffers",
        tier=2,
        extensions=[".proto"],
        capabilities=[LanguageCapability.FILE_DISCOVERY, LanguageCapability.SYMBOL_EXTRACTION, LanguageCapability.CONTRACT_ANALYSIS],
        parser_engine="Protobuf Message & Service Parser",
        description="gRPC service definitions and message field backward compatibility.",
    ),
}


class MultiLanguageParserService:
    """
    Identifies language from file paths, dispatches to language-specific parsers,
    and returns parsed symbols with stable fingerprints.
    """

    @classmethod
    def identify_language(cls, file_path: str) -> Optional[str]:
        ext = os.path.splitext(file_path)[1].lower()
        for lang_key, definition in LANGUAGE_DEFINITIONS.items():
            if ext in definition.extensions:
                return lang_key
        return None

    @classmethod
    def get_capabilities(cls, language_key: str) -> List[str]:
        defn = LANGUAGE_DEFINITIONS.get(language_key)
        return defn.capabilities if defn else []

    @classmethod
    def parse_source(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        lang = cls.identify_language(file_path)
        if not lang:
            return cls._fallback_structural_parse(file_path, code)

        if lang == "python":
            from .parser import PythonCodeParser
            parser = PythonCodeParser()
            return parser.parse_file(file_path, code)
        elif lang in ("typescript", "javascript"):
            return cls._parse_js_ts(file_path, code, is_ts=(lang == "typescript"))
        elif lang == "go":
            return cls._parse_go(file_path, code)
        elif lang == "java":
            return cls._parse_java(file_path, code)
        elif lang == "rust":
            return cls._parse_rust(file_path, code)
        elif lang in ("c", "cpp"):
            return cls._parse_c_cpp(file_path, code)
        elif lang == "ruby":
            return cls._parse_ruby(file_path, code)
        elif lang == "php":
            return cls._parse_php(file_path, code)
        else:
            return cls._fallback_structural_parse(file_path, code)

    @classmethod
    def _parse_js_ts(cls, file_path: str, code: str, is_ts: bool) -> List[ParsedSymbol]:
        """Fast regex structural parser for JS/TS classes, functions, and interfaces."""
        symbols: List[ParsedSymbol] = []
        lines = code.splitlines()

        func_pattern = re.compile(r'^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\((.*?)\)')
        arrow_pattern = re.compile(r'^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>')
        class_pattern = re.compile(r'^(?:export\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?')
        interface_pattern = re.compile(r'^(?:export\s+)?interface\s+([A-Za-z0-9_]+)')

        for i, line in enumerate(lines, start=1):
            sline = line.strip()

            m_cls = class_pattern.match(sline)
            if m_cls:
                name = m_cls.group(1)
                symbols.append(ParsedSymbol(
                    name=name,
                    qualified_name=f"{file_path}::{name}",
                    symbol_type="class",
                    start_line=i,
                    end_line=i + 15,
                    file_path=file_path,
                    signature=sline,
                    metadata={"extends": m_cls.group(2) or ""}
                ))
                continue

            m_iface = interface_pattern.match(sline)
            if m_iface and is_ts:
                name = m_iface.group(1)
                symbols.append(ParsedSymbol(
                    name=name,
                    qualified_name=f"{file_path}::{name}",
                    symbol_type="interface",
                    start_line=i,
                    end_line=i + 8,
                    file_path=file_path,
                    signature=sline
                ))
                continue

            m_fn = func_pattern.match(sline)
            if m_fn:
                name = m_fn.group(1)
                symbols.append(ParsedSymbol(
                    name=name,
                    qualified_name=f"{file_path}::{name}",
                    symbol_type="function",
                    start_line=i,
                    end_line=i + 10,
                    file_path=file_path,
                    signature=f"function {name}({m_fn.group(2)})"
                ))
                continue

            m_arrow = arrow_pattern.match(sline)
            if m_arrow:
                name = m_arrow.group(1)
                symbols.append(ParsedSymbol(
                    name=name,
                    qualified_name=f"{file_path}::{name}",
                    symbol_type="function",
                    start_line=i,
                    end_line=i + 10,
                    file_path=file_path,
                    signature=f"{name} = ({m_arrow.group(2)}) =>"
                ))

        return symbols

    @classmethod
    def _parse_go(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        symbols: List[ParsedSymbol] = []
        func_pattern = re.compile(r'^func\s+(?:\((.*?)\)\s*)?([A-Za-z0-9_]+)\s*\((.*?)\)')
        struct_pattern = re.compile(r'^type\s+([A-Za-z0-9_]+)\s+struct\b')
        interface_pattern = re.compile(r'^type\s+([A-Za-z0-9_]+)\s+interface\b')

        for i, line in enumerate(code.splitlines(), start=1):
            sline = line.strip()
            m_struct = struct_pattern.match(sline)
            if m_struct:
                name = m_struct.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="struct", start_line=i, end_line=i + 10, file_path=file_path, signature=sline
                ))
                continue

            m_iface = interface_pattern.match(sline)
            if m_iface:
                name = m_iface.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="interface", start_line=i, end_line=i + 8, file_path=file_path, signature=sline
                ))
                continue

            m_fn = func_pattern.match(sline)
            if m_fn:
                receiver = m_fn.group(1)
                name = m_fn.group(2)
                stype = "method" if receiver else "function"
                qname = f"{file_path}::{receiver}.{name}" if receiver else f"{file_path}::{name}"
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=qname,
                    symbol_type=stype, start_line=i, end_line=i + 12, file_path=file_path, signature=sline
                ))

        return symbols

    @classmethod
    def _parse_rust(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        symbols: List[ParsedSymbol] = []
        fn_pattern = re.compile(r'^(?:pub(?:\(crate\))?\s+)?(?:async\s+)?fn\s+([A-Za-z0-9_]+)')
        struct_pattern = re.compile(r'^(?:pub(?:\(crate\))?\s+)?struct\s+([A-Za-z0-9_]+)')
        enum_pattern = re.compile(r'^(?:pub(?:\(crate\))?\s+)?enum\s+([A-Za-z0-9_]+)')
        trait_pattern = re.compile(r'^(?:pub(?:\(crate\))?\s+)?trait\s+([A-Za-z0-9_]+)')

        for i, line in enumerate(code.splitlines(), start=1):
            sline = line.strip()
            for pat, stype in [(struct_pattern, "struct"), (enum_pattern, "enum"), (trait_pattern, "trait"), (fn_pattern, "function")]:
                m = pat.match(sline)
                if m:
                    name = m.group(1)
                    symbols.append(ParsedSymbol(
                        name=name, qualified_name=f"{file_path}::{name}",
                        symbol_type=stype, start_line=i, end_line=i + 8, file_path=file_path, signature=sline
                    ))
                    break
        return symbols

    @classmethod
    def _parse_java(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        symbols: List[ParsedSymbol] = []
        cls_pattern = re.compile(r'^(?:public|protected|private)?\s*(?:static\s+)?class\s+([A-Za-z0-9_]+)')
        method_pattern = re.compile(r'^(?:public|protected|private)\s+(?:static\s+)?(?:final\s+)?[\w<>,\[\]]+\s+([A-Za-z0-9_]+)\s*\(')

        for i, line in enumerate(code.splitlines(), start=1):
            sline = line.strip()
            m_cls = cls_pattern.match(sline)
            if m_cls:
                name = m_cls.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="class", start_line=i, end_line=i + 20, file_path=file_path, signature=sline
                ))
                continue
            m_meth = method_pattern.match(sline)
            if m_meth and not sline.startswith("class"):
                name = m_meth.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="method", start_line=i, end_line=i + 10, file_path=file_path, signature=sline
                ))
        return symbols

    @classmethod
    def _parse_c_cpp(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        symbols: List[ParsedSymbol] = []
        fn_pattern = re.compile(r'^[A-Za-z0-9_:\*&\s]+\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{?$')
        struct_pattern = re.compile(r'^(?:typedef\s+)?struct\s+([A-Za-z0-9_]+)')

        for i, line in enumerate(code.splitlines(), start=1):
            sline = line.strip()
            m_struct = struct_pattern.match(sline)
            if m_struct:
                name = m_struct.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="struct", start_line=i, end_line=i + 8, file_path=file_path, signature=sline
                ))
                continue
            if "(" in sline and ")" in sline and not sline.startswith(("//", "/*", "#")):
                m_fn = fn_pattern.match(sline)
                if m_fn:
                    name = m_fn.group(1)
                    if name not in ("if", "for", "while", "switch"):
                        symbols.append(ParsedSymbol(
                            name=name, qualified_name=f"{file_path}::{name}",
                            symbol_type="function", start_line=i, end_line=i + 10, file_path=file_path, signature=sline
                        ))
        return symbols

    @classmethod
    def _parse_ruby(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        symbols: List[ParsedSymbol] = []
        cls_pattern = re.compile(r'^(?:class|module)\s+([A-Za-z0-9_:]+)')
        def_pattern = re.compile(r'^\s*def\s+([A-Za-z0-9_!?=.]+)')

        for i, line in enumerate(code.splitlines(), start=1):
            sline = line.strip()
            m_cls = cls_pattern.match(sline)
            if m_cls:
                name = m_cls.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="class", start_line=i, end_line=i + 15, file_path=file_path, signature=sline
                ))
                continue
            m_def = def_pattern.match(line)
            if m_def:
                name = m_def.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="method", start_line=i, end_line=i + 8, file_path=file_path, signature=sline
                ))
        return symbols

    @classmethod
    def _parse_php(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        symbols: List[ParsedSymbol] = []
        cls_pattern = re.compile(r'^(?:abstract\s+)?class\s+([A-Za-z0-9_]+)')
        fn_pattern = re.compile(r'^(?:public|protected|private)?\s*(?:static\s+)?function\s+([A-Za-z0-9_]+)')

        for i, line in enumerate(code.splitlines(), start=1):
            sline = line.strip()
            m_cls = cls_pattern.match(sline)
            if m_cls:
                name = m_cls.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="class", start_line=i, end_line=i + 15, file_path=file_path, signature=sline
                ))
                continue
            m_fn = fn_pattern.match(sline)
            if m_fn:
                name = m_fn.group(1)
                symbols.append(ParsedSymbol(
                    name=name, qualified_name=f"{file_path}::{name}",
                    symbol_type="function", start_line=i, end_line=i + 8, file_path=file_path, signature=sline
                ))
        return symbols

    @classmethod
    def _fallback_structural_parse(cls, file_path: str, code: str) -> List[ParsedSymbol]:
        """Provides useful structural boundaries for Tier 2 or unconfigured languages."""
        symbols: List[ParsedSymbol] = []
        lines = code.splitlines()
        if len(lines) > 0:
            symbols.append(ParsedSymbol(
                name=os.path.basename(file_path),
                qualified_name=file_path,
                symbol_type="file_module",
                start_line=1,
                end_line=len(lines),
                file_path=file_path,
                signature=f"module {os.path.basename(file_path)}"
            ))
        return symbols
