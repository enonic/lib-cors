package com.enonic.lib.cors;

import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class CorsHeadersTest
    extends ScriptTestSupport
{
    @BeforeEach
    public void init()
        throws Exception
    {
        setup();
    }

    @Test
    public void testResolveWhenCorsOriginNotSet()
    {
        Map<String, String> config = new HashMap<>();

        HttpServletRequest request = mock( HttpServletRequest.class );
        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveWhenCorsOriginNotSet", config, request );
    }

    @Test
    public void testResolveCorsHeaders()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://test-cors.com:3000" );
        config.put( "cors.credentials", "true" );
        config.put( "cors.allowedHeaders", "Content-Type, Authorization" );
        config.put( "cors.methods", "POST, OPTIONS, GET" );
        config.put( "cors.exposedHeaders", "X-Custom-Header, X-Request-Id" );
        config.put( "cors.maxAge", "1200" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveCorsHeaders", config, request );
    }

    @Test
    public void testResolveCorsHeadersWithOriginFromRequest()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://test-cors.com:3000" );
        config.put( "cors.credentials", "true" );
        config.put( "cors.allowedHeaders", "Content-Type, Authorization" );
        config.put( "cors.methods", "POST, OPTIONS" );
        config.put( "cors.maxAge", "600" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveCorsHeadersWithOriginFromRequest", config, request );
    }

    @Test
    public void testResolveCorsHeadersReflectsRequestedHeadersWhenAllowedHeadersMissing()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://test-cors.com:3000" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );
        when( request.getHeader( "Access-Control-Request-Headers" ) ).thenReturn( "Content-Type, X-Trace-Id" );

        runFunction( "/com/enonic/lib/cors/test-cors.js",
                     "testResolveCorsHeadersReflectsRequestedHeadersWhenAllowedHeadersMissing", config, request );
    }

    @Test
    public void testResolveMultiOriginMatch()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://a.com, http://b.com, http://c.com" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://b.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveMultiOriginMatch", config, request );
    }

    @Test
    public void testResolveOriginMismatch()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://allowed.com" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://evil.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOriginMismatch", config, request );
    }

    @Test
    public void testResolveExposedHeadersNormalized()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );
        config.put( "cors.exposedHeaders", " X-Custom-Header, , X-Request-Id, X-Custom-Header " );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( null );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveExposedHeadersNormalized", config, request );
    }

    @Test
    public void testResolveExposedHeadersWildcardPreserved()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://test-cors.com:3000" );
        config.put( "cors.credentials", "true" );
        config.put( "cors.exposedHeaders", "*" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveExposedHeadersWildcardPreserved", config, request );
    }

    @Test
    public void testResolveWildcardOrigin()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://any.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveWildcardOrigin", config, request );
    }

    @Test
    public void testResolveWildcardOriginNoRequestOrigin()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( null );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveWildcardOriginNoRequestOrigin", config, request );
    }

    @Test
    public void testResolveWildcardOriginWithCredentials()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );
        config.put( "cors.credentials", "true" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://any.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveWildcardOriginWithCredentials", config, request );
    }

    @Test
    public void testResolveRegexOriginMatch()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "~https://.*\\.example\\.com" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "https://sub.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveRegexOriginMatch", config, request );
    }

    @Test
    public void testResolveRegexOriginMismatch()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "~https://.*\\.example\\.com" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "https://evil.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveRegexOriginMismatch", config, request );
    }

    @Test
    public void testResolveOptionsWhenCorsOriginNotSet()
    {
        Map<String, String> config = new HashMap<>();

        HttpServletRequest request = mock( HttpServletRequest.class );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOptionsWhenCorsOriginNotSet", config, request );
    }

    @Test
    public void testResolveOptionsRejectsDisallowedHeaders()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://test-cors.com:3000" );
        config.put( "cors.allowedHeaders", "Content-Type, Authorization" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );
        when( request.getHeader( "Access-Control-Request-Headers" ) ).thenReturn( "Content-Type, X-Evil-Header" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOptionsRejectsDisallowedHeaders", config, request );
    }

    @Test
    public void testResolveOptionsAllowsConfiguredHeaders()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://test-cors.com:3000" );
        config.put( "cors.allowedHeaders", "Content-Type, Authorization" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );
        when( request.getHeader( "Access-Control-Request-Headers" ) ).thenReturn( "Content-Type, Authorization" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOptionsAllowsConfiguredHeaders", config, request );
    }

    @Test
    public void testResolveOptionsRejectsDisallowedMethod()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );
        config.put( "cors.methods", "GET, POST" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Access-Control-Request-Method" ) ).thenReturn( "DELETE" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOptionsRejectsDisallowedMethod", config, request );
    }

    @Test
    public void testResolveOptionsAllowsWildcardMethod()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );
        config.put( "cors.methods", "*" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Access-Control-Request-Method" ) ).thenReturn( "DELETE" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOptionsAllowsWildcardMethod", config, request );
    }

    @Test
    public void testResolveOptionsAllowsDefaultMethod()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Access-Control-Request-Method" ) ).thenReturn( "POST" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOptionsAllowsDefaultMethod", config, request );
    }

    @Test
    public void testResolveOptionsAllowsWildcardHeaders()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );
        config.put( "cors.allowedHeaders", "*" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Access-Control-Request-Headers" ) ).thenReturn( "X-Custom, Authorization" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOptionsAllowsWildcardHeaders", config, request );
    }

    @Test
    public void testResolveMethodsNormalizedToUppercase()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );
        config.put( "cors.methods", "get, post" );

        HttpServletRequest request = mock( HttpServletRequest.class );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveMethodsNormalizedToUppercase", config, request );
    }

    @Test
    public void testResolveMixedLiteralAndRegex()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://exact.com, ~https://.*\\.example\\.com" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "https://sub.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveMixedLiteralAndRegex", config, request );
    }

    @Test
    public void testWebSocketValidatorNotConfigured()
    {
        Map<String, String> config = new HashMap<>();

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorNotConfigured", config, "https",
                     "api.example.com", 443 );
    }

    @Test
    public void testWebSocketValidatorWildcard()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "*" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorWildcard", config, "https", "api.example.com", 443 );
    }

    @Test
    public void testWebSocketValidatorExactMatch()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "https://console.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorExactMatch", config, "https", "api.example.com", 443 );
    }

    @Test
    public void testWebSocketValidatorCommaList()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "http://a.com, http://b.com, http://c.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorCommaList", config, "https", "api.example.com", 443 );
    }

    @Test
    public void testWebSocketValidatorRegex()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "~https://.*\\.example\\.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorRegex", config, "https", "api.other.com", 443 );
    }

    @Test
    public void testWebSocketValidatorAcceptsOwnOrigin()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "https://console.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorAcceptsOwnOrigin", config, "https", "api.example.com",
                     443 );
    }

    @Test
    public void testWebSocketValidatorOwnOriginKeepsNonDefaultPort()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "https://console.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorOwnOriginKeepsNonDefaultPort", config, "http", "localhost",
                     8080 );
    }

    @Test
    public void testWebSocketValidatorOwnOriginFromWebSocketScheme()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "https://console.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorOwnOriginFromWebSocketScheme", config, "wss",
                     "api.example.com", 443 );
    }

    @Test
    public void testWebSocketValidatorWithoutOwnOrigin()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "https://console.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorWithoutOwnOrigin", config, null, null, null );
    }

    @Test
    public void testWebSocketValidatorAbsentOrigin()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "https://console.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorAbsentOrigin", config, "https", "api.example.com", 443 );
    }

    @Test
    public void testWebSocketValidatorOpaqueOrigin()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "https://console.example.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorOpaqueOrigin", config, "https", "api.example.com", 443 );
    }

    @Test
    public void testWebSocketValidatorOpaqueOriginOptIn()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "null" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorOpaqueOriginOptIn", config, "https", "api.example.com",
                     443 );
    }

    @Test
    public void testWebSocketValidatorInvalidRegexFailsClosed()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.origin", "~[invalid" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testWebSocketValidatorInvalidRegexFailsClosed", config, "https",
                     "api.example.com", 443 );
    }

    @Test
    public void testGetRequestOrigin()
    {
        runFunction( "/com/enonic/lib/cors/test-cors.js", "testGetRequestOrigin" );
    }
}
