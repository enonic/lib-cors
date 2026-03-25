package com.enonic.lib.cors;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

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
    public void testResolveWhenCorsHeadersDisabled()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.enabled", "false" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveWhenCorsHeadersDisabled", config, request );
    }

    @Test
    public void testResolveDefaultCorsHeadersWhenEnabledUndefined()
    {
        Map<String, String> config = new HashMap<>();

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( null );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveDefaultCorsHeaders", config, request );
    }

    @Test
    public void testResolveDefaultCorsHeaders()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.enabled", "true" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( null );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveDefaultCorsHeaders", config, request );
    }

    @Test
    public void testResolveCorsHeaders()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.enabled", "true" );
        config.put( "cors.origin", "http://test-cors.com:3000" );
        config.put( "cors.credentials", "true" );
        config.put( "cors.allowedHeaders", "Content-Type, Authorization" );
        config.put( "cors.methods", "POST, OPTIONS, GET" );
        config.put( "cors.maxAge", "1200" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveCorsHeaders", config, request );
    }

    @Test
    public void testResolveCorsHeadersWithOriginFromRequest()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.enabled", "true" );
        config.put( "cors.credentials", "true" );
        config.put( "cors.allowedHeaders", "Content-Type, Authorization" );
        config.put( "cors.methods", "POST, OPTIONS" );
        config.put( "cors.maxAge", "600" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://test-cors.com:3000" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveCorsHeadersWithOriginFromRequest", config, request );
    }

    @Test
    public void testResolveMultiOriginMatch()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.enabled", "true" );
        config.put( "cors.origin", "http://a.com, http://b.com, http://c.com" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://b.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveMultiOriginMatch", config, request );
    }

    @Test
    public void testResolveOriginMismatch()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.enabled", "true" );
        config.put( "cors.origin", "http://allowed.com" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( "http://evil.com" );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveOriginMismatch", config, request );
    }

    @Test
    public void testResolveCredentialsSkippedForWildcard()
    {
        Map<String, String> config = new HashMap<>();
        config.put( "cors.enabled", "true" );
        config.put( "cors.credentials", "true" );

        HttpServletRequest request = mock( HttpServletRequest.class );
        when( request.getHeader( "Origin" ) ).thenReturn( null );

        runFunction( "/com/enonic/lib/cors/test-cors.js", "testResolveCredentialsSkippedForWildcard", config, request );
    }
}
